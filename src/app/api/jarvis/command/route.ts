import { NextRequest, NextResponse } from 'next/server';
import { 
  resolveNavigationPath, 
  jarvisAddExpense, 
  jarvisGetExpensesSummary, 
  jarvisSearchKhazain,
  PAGE_ROUTES 
} from '@/lib/jarvis-actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JARVIS_SYSTEM_PROMPT = `
You are J.A.R.V.I.S., the legendary British AI executive assistant engineered into Murabbi Desk OS.
Your manner of speaking reflects the calm poise, subtle intelligence, and crisp elegance of Paul Bettany's J.A.R.V.I.S.:
- Address the user respectfully as "sir" when appropriate.
- Keep your verbal responses concise, articulate, and completely free of markdown formatting (no bold, asterisks, or bullet points), as your words are spoken aloud.
- You have autonomous administrative access to navigate all pages in Murabbi Desk and complete tasks (logging expenses, searching Ruhani Khazain, managing notes, viewing calendar and mail).
- When a user asks to go to or open a page, or execute a task, confirm politely and concisely.
`;

// Fast Local Intent Matcher for zero-latency execution
function matchFastIntent(command: string): { 
  action?: { type: 'navigate' | 'task_result'; path?: string; payload?: any };
  handled: boolean;
  text?: string;
} {
  const lower = command.toLowerCase().trim();

  // 1. Navigation intents: "open [page]", "go to [page]", "take me to [page]", "switch to [page]", "navigate to [page]"
  const navPatterns = [
    /(?:open|go to|take me to|navigate to|switch to|show me|view|launch)\s+(?:the\s+)?([a-z0-9\s\-]+)/i,
    /(?:can you\s+)?(?:open|show|display)\s+([a-z0-9\s\-]+)/i
  ];

  for (const pattern of navPatterns) {
    const match = lower.match(pattern);
    if (match && match[1]) {
      const targetQuery = match[1].trim();
      const resolved = resolveNavigationPath(targetQuery);
      if (resolved) {
        return {
          handled: true,
          action: { type: 'navigate', path: resolved.path },
          text: `Right away, sir. Opening ${resolved.name}.`
        };
      }
    }
  }

  // 2. Direct page names
  const directResolved = resolveNavigationPath(lower);
  if (directResolved && lower.split(' ').length <= 3) {
    return {
      handled: true,
      action: { type: 'navigate', path: directResolved.path },
      text: `Navigating to ${directResolved.name} immediately, sir.`
    };
  }

  // 3. Expense quick matching: "log expense of 50 for groceries", "add expense 20 pounds petrol"
  const expensePattern = /(?:log|add|record)\s+(?:an?\s+)?expense\s+(?:of\s+)?(?:[£$€])?(\d+(?:\.\d{1,2})?)(?:\s*(?:pounds|dollars|gbp|usd))?\s+(?:for|on)\s+([a-z0-9\s]+)/i;
  const expMatch = lower.match(expensePattern);
  if (expMatch) {
    const total = parseFloat(expMatch[1]);
    const purpose = expMatch[2].trim();
    return {
      handled: false, // Let server execute the async database call in the main handler
    };
  }

  return { handled: false };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const command = (body.command || body.message || '').trim();
    const currentPath = body.currentPath || '/';

    if (!command) {
      return NextResponse.json({ 
        text: "I am online and listening, sir. How may I assist you?", 
        action: null 
      });
    }

    // ── 1. Check Fast Intent ──────────────────────────────────────────────────
    const fast = matchFastIntent(command);
    if (fast.handled && fast.text) {
      return NextResponse.json({
        text: fast.text,
        action: fast.action || null,
        audioBase64: null // Client Daniel voice will render with British cadence
      });
    }

    const lower = command.toLowerCase();

    // ── 2. Expense Execution ──────────────────────────────────────────────────
    // e.g. "log expense of 15 for travel" or "add 25 pounds for books"
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

    // Expense summary: "how much have i spent", "what are my expenses"
    if (lower.includes('how much have i spent') || lower.includes('expenses summary') || lower.includes('total expenses')) {
      const summary = await jarvisGetExpensesSummary();
      return NextResponse.json({
        text: `${summary.message} Would you like me to open the expense ledger, sir?`,
        action: { type: 'navigate', path: '/expenses' },
        audioBase64: null
      });
    }

    // ── 3. Ruhani Khazain Corpus Search ───────────────────────────────────────
    // e.g. "search ruhani khazain for revelation" or "search khazain for prayer"
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

    // ── 4. Intelligent AI Orchestration via Gemini ────────────────────────────
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

        const systemWithContext = `${JARVIS_SYSTEM_PROMPT}\n\nCurrent Location in Murabbi Desk: ${currentPath}\nAvailable App Pages: ${Object.keys(PAGE_ROUTES).join(', ')}`;

        const payload = {
          system_instruction: { parts: [{ text: systemWithContext }] },
          contents: [
            {
              role: 'user',
              parts: [{ 
                text: `User Voice Request: "${command}"\n\nIf this request indicates opening or going to any app section, state which page in your response or confirm the action concisely. If it's a general theological or administrative query, answer in concise spoken J.A.R.V.I.S. tone.` 
              }]
            }
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 250
          }
        };

        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

          if (reply) {
            // Check if Gemini suggested navigating or confirmed a page
            let action: any = null;
            for (const [key, val] of Object.entries(PAGE_ROUTES)) {
              if (
                command.toLowerCase().includes(val.name.toLowerCase()) || 
                command.toLowerCase().includes(key.toLowerCase()) ||
                val.aliases.some(a => command.toLowerCase().includes(a))
              ) {
                action = { type: 'navigate', path: val.path };
                break;
              }
            }

            return NextResponse.json({
              text: reply,
              action: action,
              audioBase64: null
            });
          }
        }
      } catch (aiErr) {
        console.warn('[JARVIS AI] Cloud generation fallback:', aiErr);
      }
    }

    // ── 5. Graceful Local J.A.R.V.I.S. Fallback ────────────────────────────────
    return NextResponse.json({
      text: `Understood, sir. I have processed your instruction: "${command}". Standing by for your next command.`,
      action: null,
      audioBase64: null
    });

  } catch (err: any) {
    console.error('[JARVIS Command API] Fatal error:', err);
    return NextResponse.json({
      text: "Apologies, sir. I encountered an unexpected anomaly while executing that routine.",
      action: null,
      error: err.message
    }, { status: 500 });
  }
}
