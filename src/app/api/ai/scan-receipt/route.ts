import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// The categories definition we will pass to Gemini
const SECS = [
  { idx: 0, label: "Employee Vehicle Fuel" },
  { idx: 1, label: "Employee Vehicle Maint/Oil" },
  { idx: 2, label: "Employee Vehicle Insurance" },
  { idx: 3, label: "Employee Vehicle Lic/Reg" },
  { idx: 4, label: "Employee Vehicle Washing" },
  { idx: 5, label: "Other (Description Req.)" },
  { idx: 6, label: "Phone (Employee Res.)" },
  { idx: 7, label: "Cell (Employee)" },
  { idx: 8, label: "Internet (Employee Res.)" },
  { idx: 9, label: "Employee Travel Exp" },
  { idx: 10, label: "Accommodation" },
  { idx: 11, label: "Toll/Parking" },
  { idx: 12, label: "Diyafat" },
  { idx: 13, label: "Gifts/Misc" },
  { idx: 14, label: "Waqf-e-Jadid/Tehrik-e-Jadid" },
  { idx: 15, label: "Other Items" },
  { idx: 16, label: "Comp Maint" },
  { idx: 17, label: "Software/Antiv" },
  { idx: 18, label: "Hardware" },
  { idx: 19, label: "Dental Treating/Med" },
  { idx: 20, label: "Eye Treatment/Glasses" },
  { idx: 21, label: "Other Medical" },
  { idx: 22, label: "Hydro" },
  { idx: 23, label: "Gas/Heating" },
  { idx: 24, label: "Water" },
  { idx: 25, label: "Stationery/Pr" },
  { idx: 26, label: "Postage/Ship" },
  { idx: 27, label: "Rent/Mortgage" },
  { idx: 28, label: "Property Tax" },
  { idx: 29, label: "Insurance/Maintenance" }
];

export async function POST(req: NextRequest) {
  try {
    const { mimeType, data } = await req.json();

    if (!mimeType || !data) {
      return NextResponse.json({ error: 'Missing mimeType or data' }, { status: 400 });
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

    const categoriesPrompt = SECS.map(s => `- idx ${s.idx}: ${s.label}`).join('\n');

    const requestBody = {
      system_instruction: {
        parts: [{ text: `You are an expert at scanning receipts and invoices.
Your goal is to extract the merchant name, date, total amount, tax amount (HST/GST), and categorize the expense.
Return ONLY valid JSON matching this schema:
{
  "merchant": "Name of store or merchant",
  "date": "YYYY-MM-DD",
  "total": "Total amount as string (e.g. '15.99')",
  "hst": "Tax amount as string (e.g. '2.10', or '0.00' if none)",
  "categoryIdx": number (Pick the best matching index from the list below)
}

Available Categories:
${categoriesPrompt}

If you are unsure of the category, default to 15 (Other Items) or 5 (Other).
` }]
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: "Extract details from this receipt and output JSON." },
            {
              inlineData: {
                mimeType,
                data
              }
            }
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
    console.error('[MurabbiAI] Fatal error in scan-receipt:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
