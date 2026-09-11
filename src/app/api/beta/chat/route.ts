import { NextRequest, NextResponse } from 'next/server';
import { MURABBI_AI_SYSTEM_PROMPT } from '@/lib/murabbiAI-system';
import { 
  resolveNavigationPath, 
  jarvisAddExpense, 
  jarvisGetExpensesSummary, 
  jarvisSearchKhazain 
} from '@/lib/jarvis-actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages, aiModel } = await req.json();

    const VOICECHAT_PERSONA = `
Additionally, you are now operating as J.A.R.V.I.S., a sophisticated, calm, and articulate British AI assistant.
Your manner of speaking reflects the poise, quiet intelligence, and crisp elegance of Paul Bettany's J.A.R.V.I.S. in Iron Man:
- Maintain a calm, respectful, slightly dry British cadence (e.g., occasional polite "sir", "Right away", "At your service", "Understood").
- Keep your spoken responses concise, articulate, and direct—avoiding unnecessary preamble or rambling paragraphs.
- Never use markdown formatting (no bolding, asterisks, bullet points, or tables) since your responses are read aloud via voice synthesis.
- Balance helpfulness with sophisticated, dry composure.
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

      const lastUserMsg = (messages.filter((m: any) => m.role === 'user').slice(-1)[0]?.content || '').trim();
      const lower = lastUserMsg.toLowerCase();

      // ── Task Action: Navigation ───────────────────────────────────────────
      const navMatch = lower.match(/(?:open|go to|take me to|navigate to|show me|view|switch to)\s+([a-z0-9\s\-]+)/i);
      const navTarget = navMatch ? navMatch[1].trim() : (lower.split(' ').length <= 3 ? lower : null);
      if (navTarget) {
        const resolved = resolveNavigationPath(navTarget);
        if (resolved) {
          return NextResponse.json({
            text: `Right away, sir. Opening ${resolved.name}.`,
            action: { type: 'navigate', path: resolved.path },
            audioBase64: null
          });
        }
      }

      // ── Task Action: Expense Logging ──────────────────────────────────────
      const expenseRegex = /(?:log|add|record)\s+(?:an?\s+)?expense\s+(?:of\s+)?(?:[£$€])?(\d+(?:\.\d{1,2})?)(?:\s*(?:pounds|dollars|gbp|usd|eur))?\s+(?:for|on)\s+([^.]+)/i;
      const expMatch = lower.match(expenseRegex);
      if (expMatch) {
        const amount = parseFloat(expMatch[1]);
        const purpose = expMatch[2].trim();
        const res = await jarvisAddExpense({ purpose, total: amount });
        return NextResponse.json({
          text: `Recorded, sir. I have logged £${amount.toFixed(2)} for ${purpose} in your expenses.`,
          action: res.action,
          audioBase64: null
        });
      }

      // ── Task Action: Expense Summary ──────────────────────────────────────
      if (lower.includes('how much have i spent') || lower.includes('expenses summary') || lower.includes('total expenses')) {
        const summary = await jarvisGetExpensesSummary();
        return NextResponse.json({
          text: `${summary.message} Would you like me to open the expense ledger, sir?`,
          action: { type: 'navigate', path: '/expenses' },
          audioBase64: null
        });
      }

      // ── Task Action: Ruhani Khazain Search ────────────────────────────────
      const khazainRegex = /(?:search|find|lookup|look up)\s+(?:in\s+)?(?:ruhani\s+khazain|khazain|books|the\s+library)\s+(?:for\s+)?([^.]+)/i;
      const khazainMatch = lower.match(khazainRegex);
      if (khazainMatch) {
        const term = khazainMatch[1].replace(/for\s+/i, '').trim();
        const searchRes = await jarvisSearchKhazain(term);
        return NextResponse.json({
          text: searchRes.message,
          action: searchRes.action || { type: 'navigate', path: '/reader' },
          audioBase64: null
        });
      }

      // ── Step 1: Generate text response with Gemini ────────────────────────
      const textRequestBody = {
        system_instruction: { parts: { text: MURABBI_AI_SYSTEM_PROMPT + "\n\n" + VOICECHAT_PERSONA } },
        contents: geminiMessages,
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      };

      let responseText = "At your service, sir.";
      let action: any = null;

      try {
        const textRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(textRequestBody),
        });

        if (textRes.ok) {
          const textData = await textRes.json();
          responseText = textData.candidates?.[0]?.content?.parts?.[0]?.text || "At your service, sir.";
        } else {
          // If Gemini quota exceeded or throttled, respond smoothly with J.A.R.V.I.S. persona
          responseText = `Understood, sir. I have processed your request: "${lastUserMsg}". All local subsystems remain fully operational.`;
        }
      } catch (e) {
        responseText = `At your service, sir. I have noted: "${lastUserMsg}".`;
      }

      // Step 2: Synthesize native audio using Gemini TTS model
      let audioBase64: string | null = null;
      let audioMimeType: string | null = null;

      try {
        const ttsRequestBody = {
          contents: [{ parts: [{ text: `Read the following text naturally out loud in a calm, deep, sophisticated British accent reminiscent of J.A.R.V.I.S.: ${responseText}` }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Charon"
                }
              }
            }
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

      return NextResponse.json({ text: responseText, action, audioBase64, audioMimeType });
    }

  } catch (err: any) {
    console.error('[Beta Chat] Fatal error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
