import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const APP_FOLDER = 'appDataFolder';
const NOTE_MIME = 'application/json';
function getToken(req: NextRequest) {
  const auth = req.headers.get('Authorization') || '';
  return auth.replace('Bearer ', '');
}
export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  try {
    const listRes = await fetch(
      `${DRIVE_FILES_URL}?spaces=${APP_FOLDER}&fields=files(id,name,modifiedTime)&q=mimeType='${NOTE_MIME}'`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const listData = await listRes.json();
    if (!listRes.ok) {
      console.error('[NOTES API] List error:', listData);
      return NextResponse.json({ error: listData.error?.message || 'Drive list failed' }, { status: listRes.status });
    }
    const files: { id: string; name: string; modifiedTime: string }[] = listData.files || [];
    const notes = await Promise.all(
      files.map(async (file) => {
        const contentRes = await fetch(`${DRIVE_FILES_URL}/${file.id}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!contentRes.ok) return null;
        try {
          const note = await contentRes.json();
          return { ...note, _driveId: file.id };
        } catch {
          return null;
        }
      })
    );
    return NextResponse.json({ notes: notes.filter(Boolean) });
  } catch (err: any) {
    console.error('[NOTES API] GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  try {
    const note = await req.json();
    const now = new Date().toISOString();
    const noteData = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: note.title || '',
      content: note.content || '',
      color: note.color || 'default',
      pinned: note.pinned || false,
      labels: note.labels || [],
      createdAt: now,
      updatedAt: now,
    };
    const metadata = {
      name: `${noteData.id}.json`,
      parents: [APP_FOLDER],
      mimeType: NOTE_MIME,
    };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(noteData)], { type: NOTE_MIME }));
    const uploadRes = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      return NextResponse.json({ error: uploadData.error?.message || 'Upload failed' }, { status: uploadRes.status });
    }
    return NextResponse.json({ note: { ...noteData, _driveId: uploadData.id } });
  } catch (err: any) {
    console.error('[NOTES API] POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  try {
    const body = await req.json();
    const driveId = body._driveId;
    if (!driveId) return NextResponse.json({ error: 'Missing _driveId' }, { status: 400 });
    const updated = { ...body, updatedAt: new Date().toISOString() };
    delete updated._driveId;
    const patchRes = await fetch(`${DRIVE_UPLOAD_URL}/${driveId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': NOTE_MIME,
      },
      body: JSON.stringify(updated),
    });
    if (!patchRes.ok) {
      const err = await patchRes.json();
      return NextResponse.json({ error: err.error?.message || 'Patch failed' }, { status: patchRes.status });
    }
    return NextResponse.json({ note: { ...updated, _driveId: driveId } });
  } catch (err: any) {
    console.error('[NOTES API] PATCH error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  try {
    const body = await req.json();
    const driveId = body._driveId;
    if (!driveId) return NextResponse.json({ error: 'Missing _driveId' }, { status: 400 });
    const delRes = await fetch(`${DRIVE_FILES_URL}/${driveId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!delRes.ok && delRes.status !== 204) {
      const err = await delRes.json().catch(() => ({}));
      return NextResponse.json({ error: (err as any).error?.message || 'Delete failed' }, { status: delRes.status });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[NOTES API] DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
