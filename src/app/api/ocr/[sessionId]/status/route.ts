import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const db = getDb();
    const { sessionId } = params;

    const row = db.prepare('SELECT status, text_result FROM ocr_sessions WHERE id = ?').get(sessionId) as any;

    if (!row) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: row.status, textResult: row.text_result });
  } catch (error) {
    console.error('Error fetching OCR status:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch status' }, { status: 500 });
  }
}
