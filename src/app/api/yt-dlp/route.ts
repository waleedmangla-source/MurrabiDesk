import { NextRequest, NextResponse } from "next/server";
import { spawn, execFile } from "child_process";
import path from "path";
import fs from "fs";

const PYTHON3 = "/Library/Frameworks/Python.framework/Versions/3.13/bin/python3";
const localBinPath = path.resolve(process.cwd(), "yt-dlp");
const nodeBinPath = path.resolve(process.cwd(), "node_modules/youtube-dl-exec/bin/yt-dlp");
const scriptPath = fs.existsSync(localBinPath) ? localBinPath : nodeBinPath;
const usesPython = fs.existsSync(localBinPath);

function runYtdlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = usesPython ? PYTHON3 : scriptPath;
    const fullArgs = usesPython ? [scriptPath, ...args] : args;
    execFile(cmd, fullArgs, { maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || err.message));
        return;
      }
      resolve(stdout);
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });
    }
    console.log("Fetching info for:", url);
    const output = await runYtdlp([
      url,
      "--dump-single-json",
      "--no-check-certificates",
      "--prefer-free-formats",
      "--no-warnings",
      "--add-header", "referer:youtube.com",
      "--add-header", "user-agent:googlebot"
    ]);
    const info = JSON.parse(output);
    console.log("Found video:", info.title);
    return NextResponse.json({ success: true, data: info });
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
    const infoOutput = await runYtdlp([
      url,
      "--dump-single-json",
      "--no-warnings",
      "--no-check-certificates"
    ]);
    const info = JSON.parse(infoOutput);
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
    const cmd = usesPython ? PYTHON3 : scriptPath;
    const fullArgs = usesPython ? [scriptPath, ...args] : args;
    console.log("Spawning yt-dlp with:", cmd, fullArgs.join(" "));
    const ls = spawn(cmd, fullArgs);
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
