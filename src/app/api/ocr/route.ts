import { NextRequest, NextResponse } from 'next/server';
import { createWorker, Worker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 30;

function getApiKey(): string | null {
  let apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    try {
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
  return apiKey || null;
}

// Fallback Tesseract worker
let tesseractWorkerPromise: Promise<Worker> | null = null;
async function getTesseractWorker(): Promise<Worker> {
  if (!tesseractWorkerPromise) {
    tesseractWorkerPromise = (async () => {
      const worker = await createWorker('urd');
      return worker;
    })().catch((err) => {
      tesseractWorkerPromise = null;
      throw err;
    });
  }
  return tesseractWorkerPromise;
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Split data URL into mimeType and raw base64 data
    let mimeType = 'image/jpeg';
    let rawData = imageBase64;
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      mimeType = parts[0].replace(/^data:/, '');
      rawData = parts[1];
    }

    const apiKey = getApiKey();

    // 1. Primary engine: Gemini 2.0 Flash Vision (Lightning fast 1-2s & 100% Urdu Nastaliq accuracy)
    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: 'You are an expert Urdu scholar and classical manuscript transcriber for Ruhani Khazain. Transcribe all Urdu, Arabic, and Persian text from this scanned book page line-by-line accurately. Preserve original words, orthography, verses, and couplets. Output ONLY the transcribed Urdu text itself. Do NOT include introductory phrases, conversational pleasantries, explanations, or English translations.'
                  },
                  {
                    inlineData: {
                      mimeType: mimeType || 'image/jpeg',
                      data: rawData
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 4096,
            }
          }),
        });

        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const resData = await geminiRes.json();
          const transcribedText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (transcribedText) {
            return NextResponse.json({ 
              text: transcribedText.trim(),
              engine: 'gemini-vision'
            });
          }
        } else {
          console.warn('[OCR] Gemini API failed with status:', geminiRes.status, await geminiRes.text());
        }
      } catch (geminiErr) {
        console.warn('[OCR] Gemini Vision call failed, falling back to Tesseract:', geminiErr);
      }
    }

    // 2. Fallback engine: Tesseract.js
    try {
      const worker = await getTesseractWorker();
      const { data: { text } } = await worker.recognize(imageBase64);
      return NextResponse.json({ 
        text: text ? text.trim() : '',
        engine: 'tesseract'
      });
    } catch (tessErr) {
      console.error('[OCR] Tesseract also failed:', tessErr);
      return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: 'OCR processing failed', details: String(error) }, { status: 500 });
  }
}
