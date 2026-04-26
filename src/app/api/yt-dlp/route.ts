import { NextRequest, NextResponse } from "next/server";

/**
 * YouTube Downloader API (External Service Wrapper)
 * This route now delegates all heavy lifting to an external Python service (e.g. Render.com)
 * to bypass Vercel serverless function timeouts and environment limitations.
 */

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });
    }

    // Set this environment variable in your Vercel Dashboard
    const EXTERNAL_API = process.env.YOUTUBE_API_URL || "http://localhost:5000";

    const response = await fetch(`${EXTERNAL_API}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`External service returned ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("YouTube external info error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Downloader service is currently unavailable. Please check YOUTUBE_API_URL." 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const type = req.nextUrl.searchParams.get("type") || "video";
  
  if (!url) {
    return new Response("URL required", { status: 400 });
  }

  try {
    const EXTERNAL_API = process.env.YOUTUBE_API_URL || "http://localhost:5000";
    
    // Ask the external service for the direct media link
    const response = await fetch(`${EXTERNAL_API}/download?url=${encodeURIComponent(url)}&type=${type}`);
    
    if (!response.ok) {
      throw new Error(`External service returned ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.download_url) {
      // Redirect the user directly to the high-speed YouTube stream link
      // This is the most efficient way as it bypasses Vercel entirely!
      return NextResponse.redirect(result.download_url);
    }

    return new Response("Failed to generate download link", { status: 500 });
  } catch (error: any) {
    console.error("YouTube external download error:", error);
    return new Response("External downloader service error", { status: 500 });
  }
}
