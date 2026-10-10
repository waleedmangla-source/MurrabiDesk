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
    const { bookTitle, author, notesByPage, readingTelemetry } = await req.json();

    if (!notesByPage || Object.keys(notesByPage).length === 0) {
      return NextResponse.json({ error: "No page notes provided to compile." }, { status: 400 });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_AI_API_KEY not configured in .env.local" },
        { status: 503 }
      );
    }

    // Format all user notes chronologically
    const pageEntries = Object.entries(notesByPage as Record<string, { notes: string; timeSpentSeconds?: number }>)
      .filter(([_, data]) => data?.notes && data.notes.trim().length > 0)
      .sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10));

    if (pageEntries.length === 0) {
      return NextResponse.json({ error: "All provided page notes were empty." }, { status: 400 });
    }

    let rawNotesCompilation = "";
    for (const [page, data] of pageEntries) {
      rawNotesCompilation += `--- PAGE ${page} ---\n${data.notes.trim()}\n\n`;
    }

    const systemInstruction = `
${MURABBI_AI_SYSTEM_PROMPT}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
§ LIVE READER: AI DOCUMENT COMPILER & NOTE EDITOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are an expert scholarly editor and study secretary for Murabbi Desk.
The user has read a book and made spontaneous notes across multiple pages.
Your job is to:
1. Synthesize and organize all their notes into a single cohesive, high-quality study document.
2. Fix all spelling, typos, grammatical inconsistencies, and rough phrasing while strictly preserving the user's intent and thoughts.
3. Organize logically with clear headings, bullet points, thematic sections, and page references.
4. Structure the document with:
   - Document Title (e.g. # Comprehensive Study Notes: [Book Title])
   - Executive Summary (High-level takeaway and overarching thesis)
   - Thematic Breakdown & Structured Annotations (Organized by topic, referencing the respective pages)
   - Key Theological Terms & Vocabulary (Explaining any difficult terms noted)
   - Reflections & Discussion Points (Conclusions and practical sermon/Dars application)

Format the output strictly as clean, valid Markdown. Do not include markdown code fence wrappers (such as \`\`\`markdown); provide raw markdown ready to be rendered directly.
`.trim();

    const userPrompt = `
Book: ${bookTitle || "Untitled Book"}
${author ? `Author: ${author}` : ""}
Pages with Notes: ${pageEntries.map(([p]) => p).join(", ")}
${readingTelemetry?.averagePageTimeSeconds ? `Average Reading Speed: ${Math.round(readingTelemetry.averagePageTimeSeconds)}s per page` : ""}

[RAW PAGE NOTES ACCUMULATED BY READER]:
${rawNotesCompilation}
`.trim();

    const requestBody = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 3000,
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
      return NextResponse.json({ error: `Gemini API compilation failed: ${lastError}` }, { status: 502 });
    }

    const data = await responseObj.json();
    let compiledMarkdown = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    compiledMarkdown = compiledMarkdown.replace(/^```markdown\s*/i, "").replace(/\s*```$/, "").trim();

    // Convert basic markdown to clean HTML for Google Docs integration
    const compiledHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h1>Comprehensive Study Notes: ${bookTitle || "Book"}</h1>
        <p><em>Author: ${author || "N/A"} • Compiled by MurabbiAI Live Reader</em></p>
        <hr/>
        ${compiledMarkdown
          .split("\n\n")
          .map((para) => {
            if (para.startsWith("# ")) return `<h1>${para.slice(2)}</h1>`;
            if (para.startsWith("## ")) return `<h2>${para.slice(3)}</h2>`;
            if (para.startsWith("### ")) return `<h3>${para.slice(4)}</h3>`;
            if (para.startsWith("- ") || para.startsWith("* ")) {
              const items = para.split("\n").map((li) => `<li>${li.replace(/^[-*]\s*/, "")}</li>`).join("");
              return `<ul>${items}</ul>`;
            }
            return `<p>${para.replace(/\n/g, "<br/>")}</p>`;
          })
          .join("")}
      </div>
    `;

    return NextResponse.json({
      success: true,
      title: `Study Notes - ${bookTitle || "Book"}`,
      markdown: compiledMarkdown,
      html: compiledHtml,
      totalNotesCompiled: pageEntries.length,
    });
  } catch (err: any) {
    console.error("[LIVE READER COMPILE API] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to compile notes" }, { status: 500 });
  }
}
