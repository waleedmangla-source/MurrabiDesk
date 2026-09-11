import { NextResponse } from 'next/server';
import { createWorker, Worker } from 'tesseract.js';

let workerPromise: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker('urd');
      return worker;
    })().catch((err) => {
      workerPromise = null;
      throw err;
    });
  }
  return workerPromise;
}

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const worker = await getWorker();
    const { data: { text } } = await worker.recognize(imageBase64);

    return NextResponse.json({ text: text ? text.trim() : '' });
  } catch (error) {
    console.error('OCR Error:', error);
    workerPromise = null;
    return NextResponse.json({ error: 'OCR processing failed', details: String(error) }, { status: 500 });
  }
}
