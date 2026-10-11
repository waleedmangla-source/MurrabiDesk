import { NextRequest, NextResponse } from 'next/server';
import { searchCanonicalFTS } from '@/lib/canonical-db';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getGoogleApiKey(): string | null {
  let apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const match = envFile.match(/^GOOGLE_AI_API_KEY=(.*)$/m);
        if (match && match[1]) apiKey = match[1].trim();
      }
    } catch (e) {
      console.error('[Ask-AI] Error reading .env.local:', e);
    }
  }
  return apiKey || null;
}

/**
 * Normalizes text for verbatim quote checking
 */
function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A]/g, '')
    .replace(/[«»"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Programmatically checks all quoted strings in the response against source text
 * As formulated in the Research & Development architecture
 */
function verifyQuotes(responseText: string, sourceCorpus: string) {
  const quoteRegex = /"([^"\n]{15,})"/g;
  const quotes: string[] = [];
  let match;
  while ((match = quoteRegex.exec(responseText)) !== null) {
    quotes.push(match[1].trim());
  }

  if (quotes.length === 0) {
    return { totalQuotes: 0, verifiedQuotes: 0, unverifiedQuotes: [], allVerified: true };
  }

  const normalizedSource = normalizeForComparison(sourceCorpus);
  const unverified: string[] = [];
  let verifiedCount = 0;

  for (const q of quotes) {
    const normQ = normalizeForComparison(q);
    if (normQ.length < 10) continue;
    if (normalizedSource.includes(normQ)) {
      verifiedCount++;
    } else {
      unverified.push(q);
    }
  }

  return {
    totalQuotes: quotes.length,
    verifiedQuotes: verifiedCount,
    unverifiedQuotes: unverified,
    allVerified: unverified.length === 0
  };
}

export async function POST(req: NextRequest) {
  try {
    const { query, bookSlug, author, stream = false } = await req.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const apiKey = getGoogleApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'GOOGLE_AI_API_KEY is not configured. Please add it to your .env.local file.',
          fallback: true
        },
        { status: 503 }
      );
    }

    // 1. Canonical Retrieval (Small-to-big: Search FTS5 and retrieve parent pages)
    const ftsResults = searchCanonicalFTS(query, {
      bookSlug: bookSlug || undefined,
      author: author && author !== 'all' ? author : undefined,
      limit: 10
    });

    if (ftsResults.length === 0) {
      return NextResponse.json({
        success: true,
        answer: `No canonical pages in the currently indexed library directly match your query "${query}". Please broaden your search terms or search for related keywords.`,
        citations: [],
        verification: { totalQuotes: 0, verifiedQuotes: 0, unverifiedQuotes: [], allVerified: true }
      });
    }

    // Build unique page sources
    const seenPages = new Set<string>();
    const uniqueSources = ftsResults.filter(r => {
      const key = `${r.bookSlug}:${r.pageNum}`;
      if (seenPages.has(key)) return false;
      seenPages.add(key);
      return true;
    }).slice(0, 6);

    const sourceContextText = uniqueSources
      .map((s, idx) => {
        return `[SOURCE ${idx + 1}]
Book: "${s.title}"
Author: ${s.author}
Page: ${s.pageNum}
${s.collection ? `Collection: ${s.collection}` : ''}
Text Content:
${s.textRaw}
---`;
      })
      .join('\n\n');

    const combinedSourceRaw = uniqueSources.map(s => s.textRaw).join('\n\n');

    const systemPrompt = `You are Murabbi AI, an expert scholarly theological assistant for the Ahmadiyya Muslim Community.
Your role is to answer questions objectively and comprehensively using EXCLUSIVELY the provided canonical source excerpts.

STRICT ACCURACY AND CITATION RULES:
1. CITATIONS: Every claim, theological argument, or historical reference MUST include an inline citation in square brackets citing the exact book title and page number, e.g. [Philosophy of the Teachings of Islam, Page 42].
2. VERBATIM QUOTES: When quoting the Promised Messiah (as), the Khulafa, or any canonical author, put the words inside double quotes "..." and ensure they match EXACTLY word-for-word with the text in the sources.
3. BOUNDARIES: Do not invent or assume citations. If an aspect of the question is not covered in the excerpts, state: "The indexed excerpts do not detail this aspect."
4. TONE: Scholarly, reverent, articulate, and well-structured using markdown headings and bullet points.`;

    const userPrompt = `CANONICAL SOURCE EXCERPTS:
${sourceContextText}

RESEARCH QUESTION:
${query}

Please provide a well-structured, thoroughly cited research synthesis addressing the question based on the canonical sources above.`;

    const requestBody = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.25,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2500
      }
    };

    const citations = uniqueSources.map(s => ({
      pageId: s.pageId,
      bookSlug: s.bookSlug,
      title: s.title,
      author: s.author,
      pageNum: s.pageNum,
      collection: s.collection,
      snippet: s.snippet,
      alislamScanUrl: s.alislamScanUrl
    }));

    // Fetch with fallback between gemini-2.5-flash and gemini-1.5-flash
    const fetchGemini = async (isStream: boolean) => {
      const mode = isStream ? 'streamGenerateContent?alt=sse' : 'generateContent';
      const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
      for (const m of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:${mode}&key=${apiKey}`;
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
          if (res.ok) return res;
          console.warn(`[Ask-AI] Model ${m} returned ${res.status}, trying fallback if available...`);
        } catch (e) {
          console.warn(`[Ask-AI] Model ${m} network failure:`, e);
        }
      }
      return null;
    }

    // If client requested streaming SSE
    if (stream) {
      const geminiRes = await fetchGemini(true);
      if (!geminiRes) {
        return NextResponse.json({ error: 'Failed to communicate with AI model' }, { status: 502 });
      }

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const reader = geminiRes.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          let fullAccumulatedText = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const text = new TextDecoder().decode(value);
              const lines = text.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const jsonStr = line.slice(6).trim();
                    if (!jsonStr) continue;
                    const parsed = JSON.parse(jsonStr);
                    const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (chunk) {
                      fullAccumulatedText += chunk;
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
                    }
                  } catch (e) {
                    // Ignore SSE json chunk errors
                  }
                }
              }
            }

            // Run quote verification on full text
            const verification = verifyQuotes(fullAccumulatedText, combinedSourceRaw);

            // Send citations and verification event
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ done: true, citations, verification })}\n\n`)
            );
          } catch (err) {
            console.error('[Ask-AI] Stream reading error:', err);
          } finally {
            controller.close();
          }
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive'
        }
      });
    }

    // Non-streaming standard POST mode
    const geminiRes = await fetchGemini(false);
    if (!geminiRes) {
      return NextResponse.json({ error: 'Failed to communicate with AI model' }, { status: 502 });
    }

    const data = await geminiRes.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const verification = verifyQuotes(answer, combinedSourceRaw);

    return NextResponse.json({
      success: true,
      query,
      answer,
      citations,
      verification
    });
  } catch (err: any) {
    console.error('[Ask-AI Exception]:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process AI research query' },
      { status: 500 }
    );
  }
}
