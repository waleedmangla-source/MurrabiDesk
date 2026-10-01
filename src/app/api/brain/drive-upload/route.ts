import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, content, mimeType, folderName, module, category, folderId: explicitFolderId } = await request.json();
    const tokenHeader = request.headers.get('x-murabbi-token');
    
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri
    );

    oauth2Client.setCredentials({ 
      refresh_token: tokenHeader,
      access_token: tokenHeader.startsWith('ya29.') ? tokenHeader : undefined
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    let targetFolderId = explicitFolderId;
    let createdNewFolder = false;

    // Resolve folders only if explicitFolderId was not provided
    if (!targetFolderId) {
      // 0. Ensure Root Folder is resolved
      const { getOrCreateMurabbiDeskRoot } = await import('@/lib/drive-root');
      const rootFolder = await getOrCreateMurabbiDeskRoot(drive);
      const rootFolderId = rootFolder.id;

      let parentId = rootFolderId;

      // 1. Resolve Module Folder if provided
      if (module) {
        const safeModule = module.replace(/'/g, "\\'");
        const moduleSearch = await drive.files.list({
          q: `name = '${safeModule}' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: 'files(id)',
        });

        if (moduleSearch.data.files && moduleSearch.data.files.length > 0) {
          parentId = moduleSearch.data.files[0].id!;
        } else {
          const moduleCreate = await drive.files.create({
            requestBody: {
              name: module,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [rootFolderId],
            },
            fields: 'id',
          });
          parentId = moduleCreate.data.id!;
        }
      }

      // 1.5 Resolve Category Folder if provided (e.g., Pending, Refunded, Drafts)
      if (category) {
        const safeCategory = category.replace(/'/g, "\\'");
        const categorySearch = await drive.files.list({
          q: `name = '${safeCategory}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: 'files(id)',
        });

        if (categorySearch.data.files && categorySearch.data.files.length > 0) {
          parentId = categorySearch.data.files[0].id!;
        } else {
          const categoryCreate = await drive.files.create({
            requestBody: {
              name: category,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [parentId],
            },
            fields: 'id',
          });
          parentId = categoryCreate.data.id!;
        }
      }

      // 2. Resolve Sub-Folder if folderName provided
      if (folderName) {
        const safeFolderName = folderName.replace(/'/g, "\\'");
        const folderRes = await drive.files.list({
          q: `name = '${safeFolderName}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: 'files(id, name)',
          spaces: 'drive',
        });

        if (folderRes.data.files && folderRes.data.files.length > 0) {
          targetFolderId = folderRes.data.files[0].id;
        } else {
          // Create sub-folder inside Parent (Module or Root)
          const createFolderRes = await drive.files.create({
            requestBody: {
              name: folderName,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [parentId],
            },
            fields: 'id',
          });
          targetFolderId = createFolderRes.data.id;
          createdNewFolder = true;
        }
      }

      // Default to parent if no subfolder specified
      if (!targetFolderId) {
        targetFolderId = parentId;
      }
    }

    // 2. Resolve File (Check if already exists)
    let existingFileId = '';
    const safeName = name.replace(/'/g, "\\'");
    const fileSearch = await drive.files.list({
      q: `name = '${safeName}' and '${targetFolderId}' in parents and trashed = false`,
      fields: 'files(id)',
    });

    if (fileSearch.data.files && fileSearch.data.files.length > 0) {
      existingFileId = fileSearch.data.files[0].id!;
    }

    // 3. Upload or Update File
    // If content is base64 / binary (common for PDFs/Images), convert to a Readable stream for Googleapis
    let body: any = content;
    const isBase64Candidate = typeof content === 'string' && (
      mimeType.startsWith('image/') || 
      mimeType === 'application/pdf' || 
      content.startsWith('data:')
    );

    if (isBase64Candidate) {
      const base64Data = content.includes(',') ? content.split(',')[1] : content;
      const buf = Buffer.from(base64Data.trim(), 'base64');
      body = Readable.from(buf);
    } else if (content && typeof content === 'object') {
      if (Buffer.isBuffer(content)) {
        body = Readable.from(content);
      } else if (Array.isArray(content)) {
        body = Readable.from(Buffer.from(content));
      } else if (content.type === 'Buffer' && Array.isArray(content.data)) {
        body = Readable.from(Buffer.from(content.data));
      } else if (typeof content[0] === 'number') {
        body = Readable.from(Buffer.from(Object.values(content) as number[]));
      }
    }

    const media = {
      mimeType: mimeType,
      body: body,
    };

    let file;
    if (existingFileId) {
      // Update existing file
      file = await drive.files.update({
        fileId: existingFileId,
        media: media,
        fields: 'id, name, webViewLink',
      });
    } else {
      // Create new file
      const fileMetadata: any = {
        name: name,
        parents: [targetFolderId],
      };
      file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink',
      });
    }

    const folderLink = targetFolderId ? `https://drive.google.com/drive/folders/${targetFolderId}` : (file.data.webViewLink || '');

    // Attempt to make file and folder accessible to anyone with the link
    try {
      if (createdNewFolder && targetFolderId) {
        await drive.permissions.create({
          fileId: targetFolderId,
          requestBody: { role: 'reader', type: 'anyone' },
        });
      }
      if (file.data.id) {
        await drive.permissions.create({
          fileId: file.data.id,
          requestBody: { role: 'reader', type: 'anyone' },
        });
      }
    } catch (permErr: any) {
      console.warn('Drive permission update note:', permErr?.message);
    }

    return NextResponse.json({
      success: true,
      fileId: file.data.id,
      link: file.data.webViewLink,
      folderLink,
      folderId: targetFolderId,
      updated: !!existingFileId
    });
  } catch (error: any) {
    console.error('Drive Upload Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
