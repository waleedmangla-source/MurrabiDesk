import { NextRequest, NextResponse } from "next/server";
import { MURABBI_AI_SYSTEM_PROMPT } from "@/lib/murabbiAI-system";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getApiKey(): string | null {
  let apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    try {
      const envPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, "utf8");
        const match = envFile.match(/^GOOGLE_AI_API_KEY=(.*)$/m);
        if (match) apiKey = match[1].trim();
      }
    } catch {}
  }
  return apiKey || null;
}

export async function POST(req: NextRequest) {
  try {
    const { text, pageNum, bookTitle, author, imageBase64 } = await req.json();

    if (!text && !imageBase64) {
      return NextResponse.json({ error: "No text or image content provided for analysis." }, { status: 400 });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_AI_API_KEY not configured. Please configure it in .env.local" },
        { status: 503 }
      );
    }

    const systemInstruction = `
${MURABBI_AI_SYSTEM_PROMPT}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
§ LIVE READER: MURABBIAI THEOLOGICAL ANALYSIS & PAGE CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are analyzing a page from a book being read in Murabbi Desk Live Reader.
You must analyze this page strictly from the point of view (POV), theological clarity, and scholarly depth of MurabbiAI:

1. PERSPECTIVE & RIGOR:
   - Always use proper respectful honorifics where appropriate (e.g., "the Promised Messiah (as)", "Hazrat Mirza Ghulam Ahmad (as)", "the Holy Prophet Muhammad (sa)").
   - Detail the author's logical progression, key arguments, and foundational propositions.
   - Clarify any interlocutors addressed, philosophical objections refuted, or spiritual verities established.

2. STRUCTURED JSON OUTPUT REQUIREMENTS:
   - "summary": A rich, comprehensive analysis and synopsis of this page in clear, accessible English from the POV of MurabbiAI. Detail the context and core theological or philosophical proposition.
   - "theologicalInsight": A concise takeaway for a Murabbi, missionary, or student: Highlight how this page fits into the broader thesis, its doctrinal importance, or practical takeaways for delivering a Dars or explaining to others.
   - "themes": Array of 2 to 4 central themes (e.g., ["Living Truth of Revelation", "Refutation of Prejudiced Critics"]).
   - "hardWords": Array of 3 to 8 key classical, archaic, Arabic, Urdu, or philosophical terms appearing on this page with:
     * "word": The term as found in the text.
     * "meaning": Concise English definition and theological/literary nuance.
     * "urduMeaning": Simple Urdu/vernacular explanation (if applicable).

Respond in strict JSON format (no markdown fences, just pure JSON):
{
  "summary": "...",
  "theologicalInsight": "...",
  "themes": ["...", "..."],
  "hardWords": [
    { "word": "...", "meaning": "...", "urduMeaning": "..." }
  ]
}
`.trim();

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        },
      });
    }

    let userPromptText = `Please analyze Page ${pageNum || 1}`;
    if (bookTitle) userPromptText += ` of "${bookTitle}"`;
    if (author) userPromptText += ` by ${author}`;
    userPromptText += `.\n\n`;

    if (text) {
      userPromptText += `[PAGE TEXT EXTRACT]:\n${text}\n\n`;
    }

    parts.push({ text: userPromptText });

    const requestBody = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    };

    const modelsToTry = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
    let responseObj: Response | null = null;
    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );
        if (res.ok) {
          responseObj = res;
          break;
        } else {
          lastError = await res.text();
        }
      } catch (e: any) {
        lastError = e.message;
      }
    }

    if (!responseObj) {
      return NextResponse.json({ error: `Gemini API request failed: ${lastError}` }, { status: 502 });
    }

    const data = await responseObj.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanJson = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();

    try {
      const parsed = JSON.parse(cleanJson);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        summary: rawText,
        theologicalInsight: "Analysis completed.",
        themes: [],
        hardWords: [],
      });
    }
  } catch (err: any) {
    console.error("[LIVE READER ANALYZE API] Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
