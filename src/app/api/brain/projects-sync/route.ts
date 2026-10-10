import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { createAuthorizedDriveClient, getOrCreateMurabbiDeskRoot } from '@/lib/drive-root';

export const dynamic = 'force-dynamic';

const PROJECTS_FOLDER_NAME = 'Projects';
const PROJECTS_FILE_NAME = 'projects.json';

async function getOrCreateProjectsFolder(drive: any, rootId: string): Promise<string> {
  const searchRes = await drive.files.list({
    q: `name = '${PROJECTS_FOLDER_NAME}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id)',
    spaces: 'drive',
    pageSize: 1,
  });

  if (searchRes.data.files && searchRes.data.files.length > 0) {
    return searchRes.data.files[0].id!;
  }

  const createRes = await drive.files.create({
    requestBody: {
      name: PROJECTS_FOLDER_NAME,
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
    console.warn(`[PROJECTS SYNC] Error reading ${fileName}:`, err);
    return null;
  }
}

async function saveFileJson(drive: any, folderId: string, fileName: string, data: any): Promise<void> {
  const buffer = Buffer.from(JSON.stringify(data, null, 2), 'utf8');
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const media = {
    mimeType: 'application/json',
    body: stream,
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
    });
  } else {
    await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/json',
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
    const projectsFolderId = await getOrCreateProjectsFolder(drive, rootFolder.id);

    const projects = await readFileJson(drive, projectsFolderId, PROJECTS_FILE_NAME);

    return NextResponse.json({
      projects: Array.isArray(projects) ? projects : [],
      folderId: projectsFolderId,
    });
  } catch (error: any) {
    console.error('[PROJECTS SYNC GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch projects sync data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tokenHeader = request.headers.get('x-murabbi-token');
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projects } = await request.json();

    const url = new URL(request.url);
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;
    const drive = createAuthorizedDriveClient(tokenHeader, redirectUri);

    const rootFolder = await getOrCreateMurabbiDeskRoot(drive);
    const projectsFolderId = await getOrCreateProjectsFolder(drive, rootFolder.id);

    if (projects !== undefined) {
      await saveFileJson(drive, projectsFolderId, PROJECTS_FILE_NAME, projects);
    }

    return NextResponse.json({
      success: true,
      folderId: projectsFolderId,
    });
  } catch (error: any) {
    console.error('[PROJECTS SYNC POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to save projects sync data' }, { status: 500 });
  }
}
