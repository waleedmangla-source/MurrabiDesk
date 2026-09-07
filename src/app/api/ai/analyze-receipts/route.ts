import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { receipts } = await req.json();

    if (!receipts || !Array.isArray(receipts) || receipts.length === 0) {
      return NextResponse.json({ error: 'Missing or empty receipts array' }, { status: 400 });
    }

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
        console.error('Error reading .env.local', e);
      }
    }
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GOOGLE_AI_API_KEY not configured.',
      }, { status: 503 });
    }

    const imageParts = receipts.map((r: any) => ({
      inlineData: {
        mimeType: r.type || 'image/jpeg',
        data: r.data
      }
    }));

    const requestBody = {
      system_instruction: {
        parts: [{ text: `You are an expert accountant assistant.
Your goal is to look at the provided receipts and invoices, and determine:
1. The most common month of the purchases. Output the full month name (e.g., "January", "February", etc.).
2. A short, combined description for the purpose of the expense report (e.g., "Gasoline, Office Supplies, and Hotel"). Keep it brief but descriptive.

Return ONLY valid JSON matching this schema:
{
  "month": "Month Name",
  "description": "Combined Description"
}
` }]
      },
      contents: [
        {
          role: "user",
          parts: [
            ...imageParts,
            { text: "Analyze these receipts and provide the JSON output." }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        responseMimeType: "application/json"
      }
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('[MurabbiAI] Gemini API error:', errorText);
      return NextResponse.json({ error: `Gemini API error: ${geminiRes.status}` }, { status: geminiRes.status });
    }

    const resData = await geminiRes.json();
    const textResponse = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
        return NextResponse.json({ error: 'No output from AI' }, { status: 500 });
    }

    try {
        const parsed = JSON.parse(textResponse);
        return NextResponse.json(parsed);
    } catch (e) {
        console.error("Failed to parse JSON from AI", textResponse);
        return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 });
    }

  } catch (err: any) {
    console.error('[MurabbiAI] Fatal error in analyze-receipts:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
