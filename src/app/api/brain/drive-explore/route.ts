import { NextResponse } from 'next/server';
import { createAuthorizedDriveClient, getOrCreateMurabbiDeskRoot } from '@/lib/drive-root';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { folderId } = await request.json().catch(() => ({}));
    const tokenHeader = request.headers.get('x-murabbi-token');
    
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;
    const drive = createAuthorizedDriveClient(tokenHeader, redirectUri);

    // Resolve the native Murabbi Desk root folder
    const rootFolder = await getOrCreateMurabbiDeskRoot(drive);

    let targetFolderId = folderId;
    let currentFolderName = 'Murabbi Desk';

    if (!targetFolderId || targetFolderId === 'root' || targetFolderId === rootFolder.id) {
      targetFolderId = rootFolder.id;
      currentFolderName = rootFolder.name;
    } else {
      // If browsing a subfolder, retrieve its name for display
      try {
        const folderMeta = await drive.files.get({
          fileId: targetFolderId,
          fields: 'id, name',
        });
        if (folderMeta.data.name) {
          currentFolderName = folderMeta.data.name;
        }
      } catch (metaErr) {
        console.warn('Could not fetch subfolder metadata:', metaErr);
      }
    }

    const filesRes = await drive.files.list({
      q: `'${targetFolderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, iconLink, thumbnailLink, size, modifiedTime)',
      orderBy: 'folder, modifiedTime desc',
      pageSize: 100,
    });

    return NextResponse.json({
      files: filesRes.data.files || [],
      rootFolderId: rootFolder.id,
      rootFolderName: rootFolder.name,
      currentFolder: {
        id: targetFolderId,
        name: currentFolderName,
      },
    });
  } catch (error: any) {
    console.error('Explore Drive Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

