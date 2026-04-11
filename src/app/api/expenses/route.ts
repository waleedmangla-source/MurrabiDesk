import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM expenses ORDER BY date DESC').all();
    return NextResponse.json({ success: true, expenses: rows });
  } catch (err: any) {
    console.error('Data Fetch Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    
    const stmt = db.prepare(`
      INSERT INTO expenses (id, fullName, month, date, purpose, total, status, data, refunded)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);
    
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const totalVal = parseFloat(body.total) || 0;
    
    stmt.run(id, body.fullName, body.month, body.date, body.purpose, totalVal, body.status || 'sent', body.data || null);
    
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('Data Insert Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    
    const stmt = db.prepare('UPDATE expenses SET refunded = ? WHERE id = ?');
    stmt.run(body.refunded ? 1 : 0, body.id);
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Data Update Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
