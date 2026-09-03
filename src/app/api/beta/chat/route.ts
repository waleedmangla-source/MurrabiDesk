import { NextRequest, NextResponse } from 'next/server';
import { MURRABI_AI_SYSTEM_PROMPT } from '@/lib/murrabiAI-system';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    let apiKey = process.env.NVIDIA_API_KEY || "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";
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'NVIDIA_API_KEY not configured.',
      }, { status: 503 });
    }

    const VOICECHAT_PERSONA = `
Additionally, you are now operating as a real-time, full-duplex VoiceChat engine.
Your purpose is to engage in natural, spoken conversations.
- Keep your responses highly concise, avoiding long paragraphs.
- Use a natural, conversational tone as if you are speaking aloud.
- Do not use markdown formatting (like bolding, bullet points, or complex tables) as this will be read by a text-to-speech system.
- Be prepared for interruptions and keep dialogue flowing naturally.
`;

    const requestBody = {
      model: "nvidia/nemotron-4-340b-instruct",
      messages: [
        { role: "system", content: MURRABI_AI_SYSTEM_PROMPT + "\n\n" + VOICECHAT_PERSONA },
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
