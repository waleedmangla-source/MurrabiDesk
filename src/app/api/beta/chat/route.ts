import { NextRequest, NextResponse } from 'next/server';
import { MURABBI_AI_SYSTEM_PROMPT } from '@/lib/murabbiAI-system';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages, aiModel } = await req.json();

    const VOICECHAT_PERSONA = `
Additionally, you are now operating as a real-time, full-duplex VoiceChat engine.
Your purpose is to engage in natural, spoken conversations.
- Keep your responses highly concise, avoiding long paragraphs.
- Use a natural, conversational tone as if you are speaking aloud.
- Do not use markdown formatting (like bolding, bullet points, or complex tables) as this will be read by a text-to-speech system.
- Be prepared for interruptions and keep dialogue flowing naturally.
`;

    if (aiModel === 'nemotron') {
      let apiKey = process.env.NVIDIA_API_KEY || "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";
      if (!apiKey) return NextResponse.json({ error: 'NVIDIA_API_KEY not configured.' }, { status: 503 });

      const requestBody = {
        model: "nvidia/nemotron-4-340b-instruct",
        messages: [
          { role: "system", content: MURABBI_AI_SYSTEM_PROMPT + "\n\n" + VOICECHAT_PERSONA },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2048,
      };

      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json({ error: `Nvidia API error: ${res.status} ${errorText}` }, { status: res.status });
      }

      const data = await res.json();
      return NextResponse.json({ text: data.choices[0].message.content });

    } else {
      // Gemini Logic
      let apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: 'GOOGLE_AI_API_KEY not configured.' }, { status: 503 });

      const geminiMessages = messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Step 1: Generate text response with Gemini 3.5 Flash
      const textRequestBody = {
        system_instruction: { parts: { text: MURABBI_AI_SYSTEM_PROMPT + "\n\n" + VOICECHAT_PERSONA } },
        contents: geminiMessages,
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      };

      const textRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(textRequestBody),
      });

      if (!textRes.ok) {
        const errorText = await textRes.text();
        return NextResponse.json({ error: `Gemini API error: ${textRes.status} ${errorText}` }, { status: textRes.status });
      }

      const textData = await textRes.json();
      const responseText = textData.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

      // Step 2: Synthesize native audio using Gemini TTS model
      let audioBase64: string | null = null;
      let audioMimeType: string | null = null;

      try {
        const ttsRequestBody = {
          contents: [{ parts: [{ text: `Read the following text naturally out loud: ${responseText}` }] }],
          generationConfig: {
            responseModalities: ["AUDIO"]
          }
        };

        const ttsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ttsRequestBody),
        });

        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          const part = ttsData.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (part && part.data) {
            audioBase64 = part.data;
            audioMimeType = part.mimeType || "audio/L16;codec=pcm;rate=24000";
          }
        }
      } catch (audioErr) {
        console.error('[Gemini TTS] Failed to generate native audio, fallback to WebSpeech:', audioErr);
      }

      return NextResponse.json({ text: responseText, audioBase64, audioMimeType });
    }

  } catch (err: any) {
    console.error('[Beta Chat] Fatal error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
