import { NextRequest, NextResponse } from 'next/server';
import { MURABBI_AI_SYSTEM_PROMPT } from '@/lib/murabbiAI-system';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { text, volume, pageNum, bookTitle, bookUrduTitle } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    let apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          const envFile = fs.readFileSync(envPath, 'utf8');
          const match = envFile.match(/^GOOGLE_AI_API_KEY=(.*)$/m);
          if (match) apiKey = match[1].trim();
        }
      } catch {}
    }

    if (!apiKey) return NextResponse.json({ error: 'GOOGLE_AI_API_KEY not configured in environment or .env.local' }, { status: 503 });

    const KHAZAIN_ANALYSIS_INSTRUCTION = `
${MURABBI_AI_SYSTEM_PROMPT}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
§ KHAZAIN READER: MURABBIAI PERSPECTIVE & THEOLOGICAL ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are analyzing a page from Ruhani Khazain (the foundational 80+ book corpus of Hazrat Mirza Ghulam Ahmad of Qadian, the Promised Messiah and Mahdi (as)).

You must analyze this page strictly from the point of view (POV), theological logic, and spiritual understanding of MurabbiAI:

1. PERSPECTIVE & THEOLOGICAL LOGIC:
   - Always use proper respectful honorifics: "the Promised Messiah (as)", "Hazrat Mirza Ghulam Ahmad (as)", "the Holy Prophet Muhammad (sa)".
   - Frame the discourse within Ahmadiyya theology: The Promised Messiah (as) was divinely commissioned to demonstrate the living truth, perfection, and spiritual superiority of Islam and the Holy Qur'an, revive spiritual verities, and counter contemporary intellectual and religious challenges through the "Jihad of the Pen".
   - Highlight the author's intellectual reasoning and theological logic:
     * What core proposition or divine proof is Huzoor (as) advancing on this page?
     * What flaw, prejudice, or false premise in the opponents' or interlocutors' reasoning is being systematically dismantled?
     * What deeper spiritual, philosophical, or moral verity is being illuminated?

2. STRUCTURED OUTPUT REQUIREMENTS:
   - "summary": A rich, comprehensive analysis and synopsis of this page in clear, accessible English from the POV of MurabbiAI. Detail the context, interlocutors addressed, logical flow of the argument, and the central spiritual message.
   - "theologicalInsight": A concise takeaway for a Murabbi, missionary, or student: Highlight how this page fits into the broader thesis of the book, its doctrinal importance, or practical insights for delivering a Dars, speech, or addressing questions.
   - "themes": 2 to 4 central themes or topics touched upon (e.g., "Authenticity of Divine Revelation", "Refutation of Prejudiced Critics", "The Philosophy of Divine Signs").
   - "hardWords": 3 to 8 key classical, archaic, Arabic, or Persian theological terms appearing on this page with:
     * "word": The exact Urdu word as found in the text.
     * "meaning": Concise English definition and literary/theological context.
     * "urduMeaning": Simple, clear explanation in Urdu.

Respond in strict JSON format matching this structure exactly (no markdown formatting code fences, just valid JSON):
{
  "summary": "MurabbiAI's synopsis and analytical context in English...",
  "theologicalInsight": "MurabbiAI's theological takeaway and pedagogical insight...",
  "themes": ["Theme 1", "Theme 2"],
  "hardWords": [
    { "word": "اردو لفظ", "meaning": "English definition", "urduMeaning": "آسان اردو میں معنی" }
  ]
}
`.trim();

    const userPrompt = `
Analyze the following page from Ruhani Khazain from the perspective and theological understanding of MurabbiAI:
${bookTitle ? `Book: ${bookTitle} (${bookUrduTitle || ''})` : ''}
${volume ? `Volume: ${volume}` : ''}
${pageNum ? `Page: ${pageNum}` : ''}

[PAGE TEXT]:
${text}
`.trim();

    const requestBody = {
      system_instruction: { parts: [{ text: KHAZAIN_ANALYSIS_INSTRUCTION }] },
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      generationConfig: { 
        temperature: 0.2, 
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    };

    // Try primary and fallback Gemini models
    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let textRes: Response | null = null;
    let lastError = '';

    for (const model of modelsToTry) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        if (res.ok) {
          textRes = res;
          break;
        } else {
          lastError = await res.text();
        }
      } catch (e: any) {
        lastError = e.message;
      }
    }

    if (!textRes) {
      return NextResponse.json({ error: `Gemini API request failed: ${lastError}` }, { status: 502 });
    }

    const textData = await textRes.json();
    const responseText = textData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    let parsedData = { summary: "", themes: [], hardWords: [] };
    try {
      // Strip markdown code fences if model returned them
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", responseText);
    }

    return NextResponse.json(parsedData);

  } catch (err: any) {
    console.error('[Khazain Analyze] Fatal error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
