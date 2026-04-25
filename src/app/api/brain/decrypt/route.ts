import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { encrypted } = await request.json();
    
    // In a pure web environment without Electron's safeStorage, 
    // the token stored in localStorage is likely already plain text or base64.
    // If it was encrypted by safeStorage, we can't decrypt it here,
    // so we will just return it as is or try to decode base64.
    
    // For now, we assume it's just plain text or base64 encoded.
    // If it's a real encrypted string from native safeStorage, it will fail to work,
    // and the user will need to re-authenticate.
    
    let decrypted = encrypted;
    try {
      if (encrypted.startsWith('eyJ') || !encrypted.includes(' ')) {
         // Might be base64 or JWT, but let's just return it as is.
         // If it was base64 encoded by a simple btoa:
         // decrypted = Buffer.from(encrypted, 'base64').toString('utf-8');
      }
    } catch (e) {
      // Ignore
    }

    return NextResponse.json({ decrypted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
