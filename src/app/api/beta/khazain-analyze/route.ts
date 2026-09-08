import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

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

    const SYSTEM_PROMPT = `
You are an expert scholar in classical Urdu literature and the writings of Mirza Ghulam Ahmad of Qadian (Ruhani Khazain).
Analyze the provided page of text.
1. Provide an analytical summary and theological/historical context in clear, accessible English. Explain the main arguments, interlocutors, and the purpose of the discourse.
2. Identify 3 to 8 key classical terms, theological concepts, or archaic words on this page. Provide their concise English definition and Urdu meaning.
3. List 2 to 4 central themes or topics touched upon.

Respond in strict JSON format matching this structure exactly (no markdown code fences, just valid JSON):
{
  "summary": "Detailed English context and summary of the page's arguments and message...",
  "themes": ["Theme 1", "Theme 2"],
  "hardWords": [
    { "word": "اردو لفظ", "meaning": "English meaning", "urduMeaning": "اردو معنی" }
  ]
}
`;

    const requestBody = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        { role: 'user', parts: [{ text: text }] }
      ],
      generationConfig: { 
        temperature: 0.2, 
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    };

    // Try primary and fallback Gemini models
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
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
