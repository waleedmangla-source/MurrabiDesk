import { drive_v3, google } from 'googleapis';

export const PRIMARY_ROOT_FOLDER_NAME = 'Murabbi Desk';
export const LEGACY_ROOT_FOLDER_NAME = 'Murabbi Desk Drive';

/**
 * Resolves the user's primary "Murabbi Desk" folder on Google Drive.
 * Searches for 'Murabbi Desk', 'murabbi desk', or legacy 'Murabbi Desk Drive'.
 * If none exist, automatically creates a new 'Murabbi Desk' folder.
 */
export async function getOrCreateMurabbiDeskRoot(drive: drive_v3.Drive): Promise<{ id: string; name: string }> {
  try {
    // 1. Search for existing root folder (check Murabbi Desk, murabbi desk, and Murabbi Desk Drive)
    const searchRes = await drive.files.list({
      q: `(name = '${PRIMARY_ROOT_FOLDER_NAME}' or name = 'murabbi desk' or name = '${LEGACY_ROOT_FOLDER_NAME}') and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
      pageSize: 10,
    });

    const files = searchRes.data.files || [];
    if (files.length > 0) {
      // Prioritize exact match 'Murabbi Desk' if multiple exist, else pick first found
      const exactMatch = files.find(f => f.name === PRIMARY_ROOT_FOLDER_NAME);
      const chosen = exactMatch || files[0];
      return {
        id: chosen.id!,
        name: PRIMARY_ROOT_FOLDER_NAME,
      };
    }

    // 2. Folder does not exist, create it natively
    const createRes = await drive.files.create({
      requestBody: {
        name: PRIMARY_ROOT_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id, name',
    });

    return {
      id: createRes.data.id!,
      name: PRIMARY_ROOT_FOLDER_NAME,
    };
  } catch (error) {
    console.error('[DRIVE ROOT] Failed to resolve or create Murabbi Desk folder:', error);
    throw error;
  }
}

/**
 * Resolves or creates a named subfolder within a parent directory.
 */
export async function getOrCreateSubfolder(
  drive: drive_v3.Drive,
  parentId: string,
  folderName: string
): Promise<string> {
  const searchRes = await drive.files.list({
    q: `name = '${folderName}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id)',
    spaces: 'drive',
    pageSize: 1,
  });

  if (searchRes.data.files && searchRes.data.files.length > 0) {
    return searchRes.data.files[0].id!;
  }

  const createRes = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });

  return createRes.data.id!;
}

/**
 * Helper to build an authorized Google Drive API client using a refresh or access token.
 */
export function createAuthorizedDriveClient(token: string, redirectUri?: string): drive_v3.Drive {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri || process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: token,
    access_token: token.startsWith('ya29.') ? token : undefined,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}
