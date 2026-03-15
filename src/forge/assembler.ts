import { execFile } from "child_process";
import { promisify } from "util";
import { log } from "../ui.js";
import type { Script } from "../types.js";
import * as fs from "fs/promises";
import * as path from "path";

const execFileAsync = promisify(execFile);

export async function assembleVideo(
  images: string[],
  voiceover: string,
  captions: string,
  script: Script,
  outputDir: string,
): Promise<string> {
  log("assemble", "Assembling video with FFmpeg...");
  await fs.mkdir(outputDir, { recursive: true });

  const videoId = `ghostfeed_${Date.now()}`;
  const outPath = path.join(outputDir, `${videoId}.mp4`);

  // Create concat file with durations
  const concatPath = path.join(outputDir, "concat.txt");
  let concatContent = "";
  for (let i = 0; i < images.length; i++) {
    const duration = script.segments[i]?.durationSec ?? 8;
    concatContent += `file '${path.resolve(images[i])}'\n`;
    concatContent += `duration ${duration}\n`;
  }
  // Repeat last image (concat demuxer quirk for last duration)
  if (images.length > 0) {
    concatContent += `file '${path.resolve(images[images.length - 1])}'\n`;
  }
  await fs.writeFile(concatPath, concatContent);

  // Escape captions path for FFmpeg subtitles filter
  const captionsAbs = path
    .resolve(captions)
    .replace(/\\/g, "/")
    .replace(/:/g, "\\:")
    .replace(/'/g, "'\\''");

  const vf = [
    "scale=1080:1920:force_original_aspect_ratio=decrease",
    "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
    "fps=30",
    `subtitles='${captionsAbs}'`,
  ].join(",");

  const args = [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatPath,
    "-i",
    voiceover,
    "-vf",
    vf,
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-shortest",
    "-movflags",
    "+faststart",
    outPath,
  ];

  try {
    await execFileAsync("ffmpeg", args, {
      timeout: 180000,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (err: any) {
    if (!(await fileExists(outPath))) {
      log(
        "error",
        `FFmpeg failed: ${err.stderr?.slice(0, 500) || err.message?.slice(0, 300)}`,
      );
      // Fallback without subtitles
      log("assemble", "Trying fallback (no captions)...");
      await assembleFallback(concatPath, voiceover, outPath);
    }
  }

  const stats = await fs.stat(outPath);
  log(
    "assemble",
    `Video ready: ${outPath} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`,
  );
  return outPath;
}

async function assembleFallback(
  concatPath: string,
  voiceover: string,
  outPath: string,
): Promise<void> {
  const args = [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatPath,
    "-i",
    voiceover,
    "-vf",
    "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,fps=30",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-shortest",
    outPath,
  ];
  await execFileAsync("ffmpeg", args, {
    timeout: 180000,
    maxBuffer: 10 * 1024 * 1024,
  });
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
