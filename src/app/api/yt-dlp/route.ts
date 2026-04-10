import { NextRequest, NextResponse } from "next/server";
import theytdl from "youtube-dl-exec";
import { spawn } from "child_process";
import path from "path";

// Helper to get binary path
const binPath = path.resolve(process.cwd(), "node_modules/youtube-dl-exec/bin/yt-dlp");

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });
    }

    // Capture metadata first to show the user what they are downloading
    const info = await theytdl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:googlebot'
      ]
    });

    return NextResponse.json({
      success: true,
      data: info
    });

  } catch (error: any) {
    console.error("yt-dlp info error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const type = req.nextUrl.searchParams.get("type") || "video";

  if (!url) {
    return new Response("URL required", { status: 400 });
  }

  try {
    // Determine title for filename
    const info = await theytdl(url, {
      dumpSingleJson: true,
      noWarnings: true,
    }) as any;
    
    const filename = `${info.title.replace(/[^a-z0-9]/gi, '_')}.${type === 'audio' ? 'mp3' : 'mp4'}`;

    // Prepare arguments for yt-dlp
    const args = [
      url,
      "-o", "-", // Output to stdout
      "--no-playlist",
      "--no-warnings",
    ];

    if (type === "audio") {
      args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
    } else {
      args.push("-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best");
    }

    const ls = spawn(binPath, args);

    // Readable stream for the response body
    // @ts-ignore
    const readableStream = new ReadableStream({
      start(controller) {
        ls.stdout.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        ls.stdout.on("end", () => {
          controller.close();
        });
        ls.on("error", (err) => {
          controller.error(err);
        });
        
        // Ensure child process is killed if stream is closed
        req.signal.addEventListener("abort", () => {
          ls.kill();
        });
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": type === "audio" ? "audio/mpeg" : "video/mp4",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error("yt-dlp download error:", error);
    return new Response(error.message, { status: 500 });
  }
}
