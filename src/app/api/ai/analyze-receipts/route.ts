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

    const categoryGuide = `
Category Indices:
0: Employee Vehicle Fuel (Gasoline, petrol, gas stations)
1: Employee Vehicle Maint/Oil (Car oil change, repairs)
2: Employee Vehicle Insurance
3: Employee Vehicle Lic/Reg (Driver license, vehicle registration)
4: Employee Vehicle Washing (Car wash)
5: Other Vehicle Expense
6: Phone (Employee Res.)
7: Cell (Employee) (Mobile phone bills)
8: Internet (Employee Res.) (Home internet)
9: Employee Travel Exp (Flights, train tickets, transit pass)
10: Accommodation (Hotels, motels, Airbnb)
11: Toll/Parking (Parking meters, parking lots, tolls)
12: Diyafat (Food, meals, groceries, restaurant, catering)
13: Gifts/Misc
14: Waqf-e-Jadid/Tehrik-e-Jadid
15: Other Items (General uncategorized purchases)
16: Comp Maint (Computer maintenance/repairs)
17: Software/Antiv (Software subscriptions, digital tools, apps)
18: Hardware (Laptops, monitors, cables, computer accessories)
19: Dental Treating/Med (Dental care)
20: Eye Treatment/Glasses (Glasses, optometry)
21: Other Medical (Pharmacy, prescription, medical supplies)
22: Hydro (Electricity utility)
23: Gas/Heating (Gas utility)
24: Water (Water utility)
25: Stationery/Pr (Office supplies, paper, pens, printing)
26: Postage/Ship (Stamps, courier, shipping, Canada Post, FedEx)
27: Rent/Mortgage
28: Property Tax
29: Insurance/Maintenance
`;

    const requestBody = {
      system_instruction: {
        parts: [{ text: `You are an expert accountant AI assistant scanning expense receipts/invoices.
Analyze ALL provided images carefully and extract:
1. "month": The predominant month of the purchases as a full month name (e.g., "January", "February", "March", etc.).
2. "description": A concise, clear summary of the overall purpose of these expenses suitable for an official report (e.g. "Fuel, Office Supplies & Business Meals").
3. "items": An array of extracted items. Each item represents a receipt or line item, containing:
   - "categoryIdx": The integer index (0 to 29) from the category guide below that best fits this expense.
   - "hst": Number representing tax (HST/GST/Sales Tax) in dollars (0.00 if none).
   - "total": Number representing the total expense amount in dollars.
   - "merchant": String merchant/vendor name (e.g. "Shell", "Staples", "Tim Hortons").
   - "date": String date of purchase (YYYY-MM-DD if available).

${categoryGuide}

Return ONLY valid JSON matching this schema:
{
  "month": "Month Name",
  "description": "Short overall purpose summary",
  "items": [
    {
      "categoryIdx": 0,
      "hst": 5.20,
      "total": 45.00,
      "merchant": "Merchant Name",
      "date": "YYYY-MM-DD"
    }
  ]
}
` }]
      },
      contents: [
        {
          role: "user",
          parts: [
            ...imageParts,
            { text: "Analyze all uploaded receipts and return the detailed JSON extraction." }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
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
