import { NextResponse } from 'next/server';
import { createAuthorizedDriveClient, getOrCreateMurabbiDeskRoot } from '@/lib/drive-root';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const tokenHeader = request.headers.get('x-murabbi-token');
    
    if (!tokenHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;
    const drive = createAuthorizedDriveClient(tokenHeader, redirectUri);

    const rootFolder = await getOrCreateMurabbiDeskRoot(drive);

    return NextResponse.json({ 
      rootId: rootFolder.id,
      rootName: rootFolder.name,
      success: true 
    });
  } catch (error: any) {
    console.error('Init Drive Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

