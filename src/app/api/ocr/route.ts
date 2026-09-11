import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Remove the data URI prefix if present (e.g. data:image/png;base64,)
    // Actually tesseract.js recognize can handle data URIs.

    // Initialize the Tesseract worker
    const worker = await createWorker('urd');

    // Perform OCR
    const { data: { text } } = await worker.recognize(imageBase64);
    
    await worker.terminate();

    return NextResponse.json({ text });
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: 'OCR failed' }, { status: 500 });
  }
}
