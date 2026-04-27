import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const ROOT_NAME = 'Murrabi Desk Drive';
const NOTES_FOLDER = 'Notes';
const NOTE_MIME = 'application/json';

async function getDrive(req: NextRequest) {
  const auth = req.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

async function resolveNotesFolder(drive: any) {
  // 0. Resolve Root
  let rootId = '';
  const rootSearch = await drive.files.list({
    q: `name = '${ROOT_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id)',
  });
  if (rootSearch.data.files && rootSearch.data.files.length > 0) {
    rootId = rootSearch.data.files[0].id!;
  } else {
    const rootCreate = await drive.files.create({
      requestBody: { name: ROOT_NAME, mimeType: 'application/vnd.google-apps.folder' },
      fields: 'id',
    });
    rootId = rootCreate.data.id!;
  }

  // 1. Resolve Notes Folder
  let parentId = rootId;
  const notesSearch = await drive.files.list({
    q: `name = '${NOTES_FOLDER}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id)',
  });
  if (notesSearch.data.files && notesSearch.data.files.length > 0) {
    parentId = notesSearch.data.files[0].id!;
  } else {
    const notesCreate = await drive.files.create({
      requestBody: { name: NOTES_FOLDER, mimeType: 'application/vnd.google-apps.folder', parents: [rootId] },
      fields: 'id',
    });
    parentId = notesCreate.data.id!;
  }
  return parentId;
}

export async function GET(req: NextRequest) {
  const drive = await getDrive(req);
  if (!drive) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    const parentId = await resolveNotesFolder(drive);
    const listRes = await drive.files.list({
      q: `'${parentId}' in parents and mimeType = '${NOTE_MIME}' and trashed = false`,
      fields: 'files(id, name, modifiedTime)',
    });

    const files = listRes.data.files || [];
    const notes = await Promise.all(
      files.map(async (file: any) => {
        try {
          const contentRes = await drive.files.get({
            fileId: file.id,
            alt: 'media',
          });
          return { ...contentRes.data, _driveId: file.id };
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
  const drive = await getDrive(req);
  if (!drive) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    const note = await req.json();
    const parentId = await resolveNotesFolder(drive);
    
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

    const uploadRes = await drive.files.create({
      requestBody: {
        name: `${noteData.id}.json`,
        parents: [parentId],
        mimeType: NOTE_MIME,
      },
      media: {
        mimeType: NOTE_MIME,
        body: JSON.stringify(noteData),
      },
      fields: 'id',
    });

    return NextResponse.json({ note: { ...noteData, _driveId: uploadRes.data.id } });
  } catch (err: any) {
    console.error('[NOTES API] POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const drive = await getDrive(req);
  if (!drive) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    const body = await req.json();
    const driveId = body._driveId;
    if (!driveId) return NextResponse.json({ error: 'Missing _driveId' }, { status: 400 });

    const updated = { ...body, updatedAt: new Date().toISOString() };
    delete updated._driveId;

    await drive.files.update({
      fileId: driveId,
      media: {
        mimeType: NOTE_MIME,
        body: JSON.stringify(updated),
      },
    });

    return NextResponse.json({ note: { ...updated, _driveId: driveId } });
  } catch (err: any) {
    console.error('[NOTES API] PATCH error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const drive = await getDrive(req);
  if (!drive) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    const body = await req.json();
    const driveId = body._driveId;
    if (!driveId) return NextResponse.json({ error: 'Missing _driveId' }, { status: 400 });

    await drive.files.delete({ fileId: driveId });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[NOTES API] DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
