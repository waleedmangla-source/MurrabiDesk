import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST() {
  try {
    const db = getDb();
    const sessionId = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO ocr_sessions (id, status)
      VALUES (?, 'waiting')
    `).run(sessionId);

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error('Error creating OCR session:', error);
    return NextResponse.json({ success: false, error: 'Failed to create session' }, { status: 500 });
  }
}
