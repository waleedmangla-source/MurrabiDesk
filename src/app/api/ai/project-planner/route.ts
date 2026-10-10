import { NextRequest, NextResponse } from 'next/server';
import { ResearchBookmarkItem } from '@/lib/research-storage';
import { ProjectType } from '@/lib/projects-storage';

export const runtime = 'nodejs';

function getGeminiApiKey(): string | null {
  let apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const match = envFile.match(/^GOOGLE_AI_API_KEY=(.*)$/m);
        if (match && match[1]) apiKey = match[1].trim();
      }
    } catch (e) {
      console.error('Error reading .env.local for API key', e);
    }
  }
  return apiKey || null;
}

const SYSTEM_PROMPT = `You are MurabbiAI, an elite theological composition and academic planning engine designed for Murabbi Desk OS (the official workspace for Ahmadiyya Muslim scholars, missionaries, and educators).

Your mission is to take a proposed project title, its specific delivery format (Speech, Dars, or Article), target audience, and a collection of curated research bookmarks (Quranic verses, Hadith narrations, Ruhani Khazain excerpts, Malfuzat discourses, Tazkirah revelations, Essence of Islam, or scholastic articles), and produce TWO complete, synchronized deliverables:

1. STRATEGIC APPROACH & ACTION PLAN:
   - Clear objective and audience alignment.
   - Delivery strategy tailored specifically to the format:
     * For SPEECH: Oratorical rhetoric, vocal cadence, emotional arcs, audience engagement, Hamd-o-Sana delivery, and time pacing.
     * For DARS: Pedagogical instruction, recitation breakdown, spiritual tafseer, interactive reflection questions, and classroom management.
     * For ARTICLE: Scholarly rigor, thesis argumentation arc, textual synthesis, counter-allegation refutation, and academic citation structure.
   - Phased Outline breakdown with time/word allocations, key talking points, and explicit mapping to referenced bookmarks.
   - Practical pedagogical/oratorical tips and critical pitfalls to avoid.

2. COMPREHENSIVE MOCK DRAFT MANUSCRIPT:
   - A fully fleshed-out, comprehensive manuscript formatted in clean Markdown.
   - Seamlessly weave every selected bookmark into the flow of the text. Quote relevant Arabic phrases where applicable with translation and precise theological citations (e.g., Surah:Ayat, Hadith collection, Ruhani Khazain Vol & Page, Malfuzat).
   - Format specific requirements:
     * SPEECH: Include Arabic Hamd and Tashahhud at the beginning, smooth oratorical transitions, relatable metaphors, inspirational crescendo, and closing du'a.
     * DARS: Include Arabic recitation, word breakdown, contextual revelation background (Asbab al-Nuzul), Promised Messiah (as) spiritual insight, practical contemporary life lessons, and class discussion prompts.
     * ARTICLE: Include academic abstract, thesis statement, primary textual exposition, analytical commentary, addressing counter-arguments, and concluding synthesis.

OUTPUT FORMAT:
You MUST respond with valid JSON adhering strictly to this schema:
{
  "plan": {
    "objective": "Clear single-paragraph objective of the project",
    "targetAudience": "Description of the audience and how tone is adapted",
    "deliveryStrategy": "In-depth guidance on how to deliver or write this piece effectively",
    "keyThemes": ["Theme 1", "Theme 2", "Theme 3", "Theme 4"],
    "structureBreakdown": [
      {
        "title": "Section Title (e.g. Opening Hamd & Theme Foundation)",
        "durationOrWords": "e.g. '00:00 - 03:00' or '300 words'",
        "summary": "Brief summary of what happens here",
        "talkingPoints": ["Point 1", "Point 2", "Point 3"],
        "referencedBookmarks": ["Citation or title of bookmarks used here"]
      }
    ],
    "pedagogicalTips": [
      "Actionable tip 1",
      "Actionable tip 2",
      "Actionable tip 3"
    ],
    "pitfallsToAvoid": [
      "Pitfall 1",
      "Pitfall 2"
    ]
  },
  "mockDraft": "# Full Markdown Manuscript\\n\\n[Complete written draft here with headings, citations, blockquotes, Arabic phrases, and detailed paragraphs...]"
}

Always return only JSON. No extra wrapping before or after the JSON object.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_AI_API_KEY not configured. Please check .env.local.' },
        { status: 503 }
      );
    }

    const {
      title,
      type,
      description,
      targetAudience,
      language,
      bookmarks,
    }: {
      title: string;
      type: ProjectType;
      description?: string;
      targetAudience?: string;
      language?: string;
      bookmarks: ResearchBookmarkItem[];
    } = await req.json();

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Project title and type are required' },
        { status: 400 }
      );
    }

    // Build bookmarks dossier context
    const bookmarksContext = Array.isArray(bookmarks) && bookmarks.length > 0
      ? bookmarks
          .map((b, idx) => {
            const lines = [
              `[Bookmark #${idx + 1}]`,
              `ID: ${b.id}`,
              `Category: ${b.category.toUpperCase()}`,
              `Title: ${b.title}`,
            ];
            if (b.subtitle) lines.push(`Subtitle: ${b.subtitle}`);
            if (b.citationText) lines.push(`Citation: ${b.citationText}`);
            if (b.snippet) lines.push(`Excerpt/Content: ${b.snippet}`);
            if (b.url) lines.push(`Source URL: ${b.url}`);
            if (b.metadata && Object.keys(b.metadata).length > 0) {
              const metaKeys = ['arabic', 'translation', 'surah', 'ayah', 'book', 'volume', 'page'];
              const filteredMeta: Record<string, any> = {};
              metaKeys.forEach(k => {
                if (b.metadata?.[k]) filteredMeta[k] = b.metadata[k];
              });
              if (Object.keys(filteredMeta).length > 0) {
                lines.push(`Key Metadata: ${JSON.stringify(filteredMeta)}`);
              }
            }
            return lines.join('\n');
          })
          .join('\n\n---\n\n')
      : 'No specific bookmarks attached. Build comprehensive scholarly content using primary Quranic verses, Hadith, and Ruhani Khazain foundations relevant to the topic.';

    const userPrompt = `PROJECT SPECIFICATIONS:
- Project Title: "${title}"
- Format Type: ${type.toUpperCase()}
- Target Audience: ${targetAudience || 'General Audience / Community'}
- Language Preference: ${language || 'English (with standard Arabic transliteration and citations)'}
- Creator Notes & Focus Angle: ${description || 'Comprehensive and inspiring treatment of the subject.'}

CURATED RESEARCH DOSSIER (${Array.isArray(bookmarks) ? bookmarks.length : 0} items):
${bookmarksContext}

INSTRUCTIONS:
Generate the JSON output containing both the "plan" (strategic approach & breakdown) and "mockDraft" (full Markdown text) meticulously incorporating these research materials. Output raw JSON only.`;

    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('[Project Planner] Gemini API error:', errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${geminiRes.status}` },
        { status: geminiRes.status }
      );
    }

    const resData = await geminiRes.json();
    const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(
        { error: 'No response generated from AI model' },
        { status: 500 }
      );
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch (parseErr) {
      // Clean possible markdown code fences if responseMimeType wasn't fully adhered
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
      parsedResult = JSON.parse(cleaned);
    }

    return NextResponse.json({
      success: true,
      plan: parsedResult.plan,
      mockDraft: parsedResult.mockDraft,
    });
  } catch (error: any) {
    console.error('[Project Planner API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate project plan and draft' },
      { status: 500 }
    );
  }
}
