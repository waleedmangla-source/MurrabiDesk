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
    if (!apiKey) return NextResponse.json({ error: 'GOOGLE_AI_API_KEY not configured.' }, { status: 503 });

    const SYSTEM_PROMPT = `
You are an expert in Urdu literature, specifically the writings of Mirza Ghulam Ahmad (Ruhani Khazain).
Analyze the following page of text.
1. Identify all "hard" or archaic Urdu/Persian/Arabic words that a modern Urdu reader might struggle with. Do NOT include common Urdu words.
2. Provide their meanings in simple Urdu.
3. Provide a brief summary/context of the page in English.

Respond in strict JSON format matching this structure exactly (no markdown formatting around it, just the raw JSON object):
{
  "summary": "Brief summary here...",
  "hardWords": [
    { "word": "word1", "meaning": "meaning1" }
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

    const textRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!textRes.ok) {
      const errorText = await textRes.text();
      return NextResponse.json({ error: `Gemini API error: ${textRes.status} ${errorText}` }, { status: textRes.status });
    }

    const textData = await textRes.json();
    const responseText = textData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    let parsedData = { summary: "", hardWords: [] };
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", responseText);
    }

    return NextResponse.json(parsedData);

  } catch (err: any) {
    console.error('[Khazain Analyze] Fatal error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
