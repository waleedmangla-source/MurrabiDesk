import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { createAuthorizedDriveClient, getOrCreateMurabbiDeskRoot } from '@/lib/drive-root';

export const dynamic = 'force-dynamic';

const RESEARCH_FOLDER_NAME = 'Research';
const HISTORY_FILE_NAME = 'search-history.json';
const BOOKMARKS_FILE_NAME = 'bookmarks.json';

async function getOrCreateResearchFolder(drive: any, rootId: string): Promise<string> {
  const searchRes = await drive.files.list({
    q: `name = '${RESEARCH_FOLDER_NAME}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id)',
    spaces: 'drive',
    pageSize: 1,
  });

  if (searchRes.data.files && searchRes.data.files.length > 0) {
    return searchRes.data.files[0].id!;
  }

  const createRes = await drive.files.create({
    requestBody: {
      name: RESEARCH_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [rootId],
    },
    fields: 'id',
  });

  return createRes.data.id!;
}

async function readFileJson(drive: any, folderId: string, fileName: string): Promise<any> {
  try {
    const listRes = await drive.files.list({
      q: `name = '${fileName}' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id)',
      spaces: 'drive',
      pageSize: 1,
    });

    if (!listRes.data.files || listRes.data.files.length === 0) {
      return null;
    }

    const fileId = listRes.data.files[0].id!;
    const getRes = await drive.files.get({
      fileId,
      alt: 'media',
    });

    if (typeof getRes.data === 'string') {
      return JSON.parse(getRes.data);
    }
    return getRes.data;
  } catch (err) {
    console.warn(`[RESEARCH SYNC] Error reading ${fileName}:`, err);
    return null;
  }
}

async function saveFileJson(drive: any, folderId: string, fileName: string, content: any): Promise<void> {
  const jsonStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  const media = {
    mimeType: 'application/json',
    body: Readable.from(Buffer.from(jsonStr, 'utf-8')),
  };

  const listRes = await drive.files.list({
    q: `name = '${fileName}' and '${folderId}' in parents and trashed = false`,
    fields: 'files(id)',
    spaces: 'drive',
    pageSize: 1,
  });

  if (listRes.data.files && listRes.data.files.length > 0) {
    const fileId = listRes.data.files[0].id!;
    await drive.files.update({
      fileId,
      media,
      fields: 'id',
    });
  } else {
    await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media,
      fields: 'id',
    });
  }
}

export async function GET(request: Request) {
  try {
    const tokenHeader = request.headers.get('x-murabbi-token');
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;
    const drive = createAuthorizedDriveClient(tokenHeader, redirectUri);

    const rootFolder = await getOrCreateMurabbiDeskRoot(drive);
    const researchFolderId = await getOrCreateResearchFolder(drive, rootFolder.id);

    const [history, bookmarks] = await Promise.all([
      readFileJson(drive, researchFolderId, HISTORY_FILE_NAME),
      readFileJson(drive, researchFolderId, BOOKMARKS_FILE_NAME)
    ]);

    return NextResponse.json({
      history: Array.isArray(history) ? history : [],
      bookmarks: Array.isArray(bookmarks) ? bookmarks : [],
      folderId: researchFolderId
    });
  } catch (error: any) {
    console.error('[RESEARCH SYNC GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch research sync data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tokenHeader = request.headers.get('x-murabbi-token');
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { history, bookmarks } = await request.json();

    const url = new URL(request.url);
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;
    const drive = createAuthorizedDriveClient(tokenHeader, redirectUri);

    const rootFolder = await getOrCreateMurabbiDeskRoot(drive);
    const researchFolderId = await getOrCreateResearchFolder(drive, rootFolder.id);

    const ops = [];
    if (history !== undefined) {
      ops.push(saveFileJson(drive, researchFolderId, HISTORY_FILE_NAME, history));
    }
    if (bookmarks !== undefined) {
      ops.push(saveFileJson(drive, researchFolderId, BOOKMARKS_FILE_NAME, bookmarks));
    }

    await Promise.all(ops);

    return NextResponse.json({
      success: true,
      folderId: researchFolderId
    });
  } catch (error: any) {
    console.error('[RESEARCH SYNC POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to save research sync data' }, { status: 500 });
  }
}
