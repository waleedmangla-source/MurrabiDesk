import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { mode, text, prompt, recipient, query } = await req.json();

    let apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      try {
        const fs = require("fs");
        const path = require("path");
        const envPath = path.join(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
          const envFile = fs.readFileSync(envPath, "utf8");
          const match = envFile.match(/^GOOGLE_AI_API_KEY=(.*)$/m);
          if (match && match[1]) apiKey = match[1].trim();
        }
      } catch (e) {
        console.error("Error reading .env.local", e);
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_AI_API_KEY not configured." },
        { status: 503 }
      );
    }

    let systemInstruction = "";
    let userPrompt = "";

    if (mode === "translate") {
      systemInstruction =
        "You are an expert translator specializing in formal Urdu for official Ahmadiyya Muslim Community correspondence. Translate the user's English or mixed text accurately into high-register, respectful, formal Urdu. Return ONLY the Urdu translation text with no English explanations or preamble.";
      userPrompt = `Translate the following text into formal Urdu:\n\n${text}`;
    } else if (mode === "draft") {
      systemInstruction =
        "You are an expert secretary composing official Ahmadiyya Muslim Community letters in formal Urdu. Write a respectful, formal Urdu letter body based on the user's topic. Do NOT include the Bismillah header, greeting, or sign-off signature block (such as Wassalam or Khaksar) as those are automatically added by the template layout. Return ONLY the main letter body in formal Urdu.";
      userPrompt = `Target Recipient: ${recipient || "Respected Authority"}\nTopic / Key Details: ${prompt}`;
    } else if (mode === "smart_search") {
      systemInstruction =
        'You are an intelligent assistant analyzing user requests for official letters. Your job is to select the most appropriate category and sub-category for the letter request, extract any extracted details (like destination country, dates, or custom letter content), and compose a formal Urdu letter body if applicable. Return valid JSON only with keys: "categoryId" (one of: "huzoor", "amir", "tabshir", "request", "missionary"), "subCategoryId" (if category is huzoor, one of: "prayers", "leave_international", "uk_accommodation", or null), "country" (string or null), "fromDate" (YYYY-MM-DD or null), "toDate" (YYYY-MM-DD or null), "wifePermission" (boolean or null), "urduBody" (formal Urdu letter text or null). Do NOT wrap in markdown markdown backticks.';
      userPrompt = `User Request / Voice Query: ${query}`;
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const requestBody = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Letter AI Generator Error]", errText);
      return NextResponse.json(
        { error: `Gemini API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const resultText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (mode === "smart_search") {
      try {
        const cleanJsonText = resultText.replace(/^```json\s*|\s*```$/g, "").trim();
        const parsedData = JSON.parse(cleanJsonText);
        return NextResponse.json(parsedData);
      } catch (jsonErr) {
        console.error("JSON parse error for smart_search:", jsonErr, resultText);
        return NextResponse.json({
          categoryId: "huzoor",
          subCategoryId: "prayers",
          urduBody: null,
        });
      }
    }

    return NextResponse.json({ result: resultText });
  } catch (error: any) {
    console.error("Letter AI Route Exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
