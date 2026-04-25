import { NextRequest, NextResponse } from "next/server";
import { create as createYtdl } from "youtube-dl-exec";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
const localBinPath = path.resolve(process.cwd(), "yt-dlp");
const nodeBinPath = path.resolve(process.cwd(), "node_modules/youtube-dl-exec/bin/yt-dlp");
const binPath = fs.existsSync(localBinPath) ? localBinPath : nodeBinPath;
const ytdl = createYtdl(binPath);
export async function POST(req: NextRequest) {

  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });
    }
    console.log("Fetching info for:", url);
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
    const info = await ytdl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
    }) as any;
    const filename = `${info.title.replace(/[^a-z0-9]/gi, '_')}.${type === 'audio' ? 'mp3' : 'mp4'}`;
    const args = [
      url,
      "-o", "-",
      "--no-playlist",
      "--no-warnings",
      "--no-check-certificates",
    ];
    if (type === "audio") {
      args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
    } else {
      args.push("-f", "best[ext=mp4]/best");
    }
    const spawnCmd = binPath === localBinPath ? "python3" : binPath;
    const spawnArgs = binPath === localBinPath ? [binPath, ...args] : args;
    console.log("Spawning yt-dlp with:", spawnCmd, spawnArgs.join(" "));
    const ls = spawn(spawnCmd, spawnArgs, {
      env: { ...process.env, PATH: `${process.env.PATH}:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin` }
    });

    let errorLog = "";
    ls.stderr.on("data", (data) => {
      errorLog += data.toString();
      console.error(`yt-dlp stderr: ${data}`);
    });
    const readableStream = new ReadableStream({
      start(controller) {
        ls.stdout.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        ls.stdout.on("end", () => {
          controller.close();
        });
        ls.on("error", (err) => {
          console.error("Spawn error:", err);
          controller.error(err);
        });
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
