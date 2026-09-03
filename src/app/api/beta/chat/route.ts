import { NextRequest, NextResponse } from 'next/server';
import { MURRABI_AI_SYSTEM_PROMPT } from '@/lib/murrabiAI-system';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    let apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          const envFile = fs.readFileSync(envPath, 'utf8');
          const match = envFile.match(/^NVIDIA_API_KEY=(.*)$/m);
          if (match && match[1]) apiKey = match[1].trim();
        }
      } catch (e) {
        console.error('Error reading .env.local', e);
      }
    }
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'NVIDIA_API_KEY not configured.',
      }, { status: 503 });
    }

    const requestBody = {
      model: "nvidia/nemotron-4-340b-instruct",
      messages: [
        { role: "system", content: MURRABI_AI_SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 2048,
    };

    const url = "https://integrate.api.nvidia.com/v1/chat/completions";

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Nvidia API] error:', errorText);
      return NextResponse.json({ error: `Nvidia API error: ${res.status} ${errorText}` }, { status: res.status });
    }

    const data = await res.json();
    const text = data.choices[0].message.content;
    return NextResponse.json({ text });

  } catch (err: any) {
    console.error('[Beta Chat] Fatal error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
