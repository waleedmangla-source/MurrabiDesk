import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getOrCreateMurabbiDeskRoot, getOrCreateSubfolder } from "@/lib/drive-root";

export const dynamic = "force-dynamic";

const LIVE_READER_FOLDER = "Live Reader";
const JSON_MIME = "application/json";

async function getDrive(req: NextRequest) {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "") || req.headers.get("x-murabbi-token") || "";
  if (!token) return null;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    refresh_token: token.startsWith("ya29.") ? undefined : token,
    access_token: token.startsWith("ya29.") ? token : undefined,
  });
  return google.drive({ version: "v3", auth: oauth2Client });
}

// GET: Retrieve a book's notes JSON from Google Drive
export async function GET(req: NextRequest) {
  const drive = await getDrive(req);
  if (!drive) {
    return NextResponse.json({ error: "Unauthorized (No Google Drive token)" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "Missing bookId query parameter" }, { status: 400 });
  }

  try {
    const root = await getOrCreateMurabbiDeskRoot(drive);
    const folderId = await getOrCreateSubfolder(drive, root.id, LIVE_READER_FOLDER);

    const fileName = `live_reader_${bookId}.json`;
    const searchRes = await drive.files.list({
      q: `'${folderId}' in parents and name = '${fileName}' and trashed = false`,
      fields: "files(id, name, modifiedTime)",
      pageSize: 1,
    });

    const files = searchRes.data.files || [];
    if (files.length === 0) {
      return NextResponse.json({ found: false, data: null });
    }

    const fileId = files[0].id!;
    const contentRes = await drive.files.get({
      fileId,
      alt: "media",
    });

    return NextResponse.json({
      found: true,
      fileId,
      modifiedTime: files[0].modifiedTime,
      data: contentRes.data,
    });
  } catch (err: any) {
    console.error("[LIVE READER NOTES API] GET error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch from Drive" }, { status: 500 });
  }
}

// POST: Save or update a book's notes JSON on Google Drive
export async function POST(req: NextRequest) {
  const drive = await getDrive(req);
  if (!drive) {
    return NextResponse.json({ error: "Unauthorized (No Google Drive token)" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { bookId, progress } = body;

    if (!bookId || !progress) {
      return NextResponse.json({ error: "Missing bookId or progress payload" }, { status: 400 });
    }

    const root = await getOrCreateMurabbiDeskRoot(drive);
    const folderId = await getOrCreateSubfolder(drive, root.id, LIVE_READER_FOLDER);

    const fileName = `live_reader_${bookId}.json`;
    const searchRes = await drive.files.list({
      q: `'${folderId}' in parents and name = '${fileName}' and trashed = false`,
      fields: "files(id, name)",
      pageSize: 1,
    });

    const files = searchRes.data.files || [];
    const payloadWithTime = {
      ...progress,
      lastSynced: new Date().toISOString(),
    };

    let savedFileId = "";

    if (files.length > 0) {
      // Update existing file
      savedFileId = files[0].id!;
      await drive.files.update({
        fileId: savedFileId,
        media: {
          mimeType: JSON_MIME,
          body: JSON.stringify(payloadWithTime, null, 2),
        },
      });
    } else {
      // Create new file
      const createRes = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [folderId],
          mimeType: JSON_MIME,
        },
        media: {
          mimeType: JSON_MIME,
          body: JSON.stringify(payloadWithTime, null, 2),
        },
        fields: "id",
      });
      savedFileId = createRes.data.id!;
    }

    return NextResponse.json({
      success: true,
      fileId: savedFileId,
      lastSynced: payloadWithTime.lastSynced,
      fileName,
    });
  } catch (err: any) {
    console.error("[LIVE READER NOTES API] POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to save to Drive" }, { status: 500 });
  }
}
