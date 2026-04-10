import { NextRequest, NextResponse } from "next/server";
import { create as createYtdl } from "youtube-dl-exec";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

// Helper to get binary path
const binPath = path.resolve(process.cwd(), "node_modules/youtube-dl-exec/bin/yt-dlp");
const ytdl = createYtdl(binPath);

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });
    }

    console.log("Fetching info for:", url);

    // Capture metadata first to show the user what they are downloading
    const info = await ytdl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      noWarnings: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:googlebot'
      ]
    });

    console.log("Found video:", (info as any).title);

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
    console.log(`Starting ${type} download for:`, url);

    // Determine title for filename
    const info = await ytdl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
    }) as any;
    
    const filename = `${info.title.replace(/[^a-z0-9]/gi, '_')}.${type === 'audio' ? 'mp3' : 'mp4'}`;

    // Prepare arguments for yt-dlp
    // We use a simpler format if ffmpeg might be missing
    const args = [
      url,
      "-o", "-", // Output to stdout
      "--no-playlist",
      "--no-warnings",
      "--no-check-certificates",
    ];

    if (type === "audio") {
      args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
    } else {
      // Force single file downloads (usually 720p or lower) if we don't have ffmpeg for merging
      args.push("-f", "best[ext=mp4]/best");
    }

    console.log("Spawning yt-dlp with args:", args.join(" "));

    const ls = spawn(binPath, args, {
      env: { ...process.env, PATH: `${process.env.PATH}:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin` }
    });

    // Capture stderr for debugging
    let errorLog = "";
    ls.stderr.on("data", (data) => {
      errorLog += data.toString();
      console.error(`yt-dlp stderr: ${data}`);
    });

    // Readable stream for the response body
    // @ts-ignore
    const readableStream = new ReadableStream({
      start(controller) {
        ls.stdout.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        ls.stdout.on("end", () => {
          if (errorLog && !ls.stdout.readableLength) {
             console.error("Downloader finished with errors and no data.");
          }
          controller.close();
        });
        ls.on("error", (err) => {
          console.error("Spawn error:", err);
          controller.error(err);
        });
        
        // Ensure child process is killed if stream is closed
        req.signal.addEventListener("abort", () => {
          console.log("Client aborted request, killing yt-dlp process.");
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
