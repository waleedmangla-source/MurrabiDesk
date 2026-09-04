import { NextRequest, NextResponse } from 'next/server';
import { MURRABI_AI_SYSTEM_PROMPT } from '@/lib/murrabiAI-system';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    let apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GOOGLE_AI_API_KEY not configured.',
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

    // Map OpenAI style messages to Gemini style
    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const requestBody = {
      system_instruction: {
        parts: { text: MURRABI_AI_SYSTEM_PROMPT + "\n\n" + VOICECHAT_PERSONA }
      },
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Gemini API] error:', errorText);
      return NextResponse.json({ error: `Gemini API error: ${res.status} ${errorText}` }, { status: res.status });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    return NextResponse.json({ text });

  } catch (err: any) {
    console.error('[Beta Chat] Fatal error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
