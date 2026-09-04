import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import Tesseract from 'tesseract.js';

export async function POST(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params;
    const db = getDb();
    
    // Update status to processing
    db.prepare('UPDATE ocr_sessions SET status = ? WHERE id = ?').run('processing', sessionId);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      db.prepare('UPDATE ocr_sessions SET status = ?, text_result = ? WHERE id = ?').run('error', 'No file uploaded', sessionId);
      return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Start OCR processing
    const result = await Tesseract.recognize(buffer, 'eng');
    const text = result.data.text;
    
    // Save result to DB
    db.prepare('UPDATE ocr_sessions SET status = ?, text_result = ? WHERE id = ?').run('completed', text, sessionId);
    
    return NextResponse.json({ success: true, text });
  } catch (error: any) {
    console.error('OCR Error:', error);
    const db = getDb();
    db.prepare('UPDATE ocr_sessions SET status = ?, text_result = ? WHERE id = ?').run('error', error.message || 'Unknown error', params.sessionId);
    return NextResponse.json({ success: false, error: 'Processing failed' }, { status: 500 });
  }
}
