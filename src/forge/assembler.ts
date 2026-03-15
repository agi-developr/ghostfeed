import { execFile } from "child_process";
import { promisify } from "util";
import { log } from "../ui.js";
import type { Script } from "../types.js";
import * as fs from "fs/promises";
import * as path from "path";

const execFileAsync = promisify(execFile);

// Ken Burns motion patterns — alternates between zoom-in and zoom-out with pan
const MOTION_PATTERNS = [
  // Slow zoom in from center
  {
    zFrom: 1.0,
    zTo: 1.15,
    xExpr: "iw/2-(iw/zoom/2)",
    yExpr: "ih/2-(ih/zoom/2)",
  },
  // Slow zoom out with slight left pan
  {
    zFrom: 1.2,
    zTo: 1.0,
    xExpr: "iw/4-(iw/zoom/4)",
    yExpr: "ih/2-(ih/zoom/2)",
  },
  // Zoom in toward top-right
  {
    zFrom: 1.0,
    zTo: 1.18,
    xExpr: "iw/2-(iw/zoom/3)",
    yExpr: "ih/3-(ih/zoom/3)",
  },
  // Zoom out from bottom-left
  {
    zFrom: 1.15,
    zTo: 1.0,
    xExpr: "iw/3-(iw/zoom/4)",
    yExpr: "ih/2-(ih/zoom/3)",
  },
  // Slow zoom in center-bottom
  {
    zFrom: 1.0,
    zTo: 1.12,
    xExpr: "iw/2-(iw/zoom/2)",
    yExpr: "ih*2/3-(ih/zoom/2)",
  },
];

export async function assembleVideo(
  images: string[],
  voiceover: string,
  captions: string,
  script: Script,
  outputDir: string,
  opts?: { fadeDuration?: number; crf?: number },
): Promise<string> {
  log("assemble", "Assembling video with Ken Burns motion + crossfades...");
  await fs.mkdir(outputDir, { recursive: true });

  const videoId = `ghostfeed_${Date.now()}`;
  const outPath = path.join(outputDir, `${videoId}.mp4`);
  const FPS = 30;
  const FADE_DUR = opts?.fadeDuration ?? 0.8;
  const CRF = opts?.crf ?? 20;

  const inputArgs: string[] = [];
  const filterParts: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const duration = script.segments[i]?.durationSec ?? 8;
    const totalFrames = Math.round(duration * FPS);
    const motion = MOTION_PATTERNS[i % MOTION_PATTERNS.length];

    // Zoom interpolation: linearly move from zFrom to zTo over totalFrames
    const zExpr = `${motion.zFrom}+(${motion.zTo}-${motion.zFrom})*on/${totalFrames}`;

    // Single image input — zoompan d= controls output frame count
    inputArgs.push("-i", path.resolve(images[i]));

    // Scale up to allow zoom headroom, apply zoompan for motion, then fade in/out for crossfade
    let filter = `[${i}:v]scale=1920:-1,zoompan=z='${zExpr}':x='${motion.xExpr}':y='${motion.yExpr}':d=${totalFrames}:s=1080x1920:fps=${FPS},setsar=1`;

    // Fade out on all except last
    if (i < images.length - 1) {
      const fadeOutStart = duration - FADE_DUR;
      filter += `,fade=t=out:st=${fadeOutStart}:d=${FADE_DUR}`;
    }
    // Fade in on all except first
    if (i > 0) {
      filter += `,fade=t=in:st=0:d=${FADE_DUR}`;
    }

    filter += `[v${i}]`;
    filterParts.push(filter);
  }

  // Audio input is after all image inputs
  const audioIdx = images.length;
  inputArgs.push("-i", path.resolve(voiceover));

  // Resolve captions path and escape for FFmpeg (colons need escaping)
  const absCaption = path.resolve(captions).replace(/:/g, "\\:");

  const concatInputs = images.map((_, i) => `[v${i}]`).join("");
  const filterComplex = [
    ...filterParts,
    `${concatInputs}concat=n=${images.length}:v=1:a=0[outv]`,
    `[outv]ass='${absCaption}'[final]`,
  ].join(";");

  const args = [
    "-y",
    ...inputArgs,
    "-filter_complex",
    filterComplex,
    "-map",
    "[final]",
    "-map",
    `${audioIdx}:a`,
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    String(CRF),
    "-r",
    String(FPS),
    "-g",
    String(FPS),
    "-pix_fmt",
    "yuv420p",
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
      timeout: 600000,
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch (err: any) {
    if (!(await fileExists(outPath))) {
      log(
        "error",
        `FFmpeg failed: ${err.stderr?.slice(-500) || err.message?.slice(0, 300)}`,
      );
      throw new Error("Video assembly failed");
    }
  }

  const stats = await fs.stat(outPath);
  log(
    "assemble",
    `Video ready: ${outPath} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`,
  );
  return outPath;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
