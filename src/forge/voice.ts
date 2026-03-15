import { execFile } from "child_process";
import { promisify } from "util";
import { log } from "../ui.js";
import * as fs from "fs/promises";
import * as path from "path";

const execFileAsync = promisify(execFile);

const VOICE = "Samantha"; // Best quality macOS voice

export async function generateVoiceover(
  text: string,
  outputDir: string,
): Promise<string> {
  log("voice", "Generating voiceover via macOS TTS...");
  await fs.mkdir(outputDir, { recursive: true });

  const aiffPath = path.join(outputDir, "voiceover.aiff");
  const mp3Path = path.join(outputDir, "voiceover.mp3");

  // Generate with macOS say command (high quality, no API limits)
  await execFileAsync("say", ["-v", VOICE, "-r", "175", "-o", aiffPath, text], {
    timeout: 60000,
  });

  // Convert to mp3
  await execFileAsync(
    "ffmpeg",
    ["-y", "-i", aiffPath, "-acodec", "libmp3lame", "-q:a", "2", mp3Path],
    { timeout: 30000, maxBuffer: 10 * 1024 * 1024 },
  );

  // Clean up aiff
  await fs.unlink(aiffPath).catch(() => {});

  const stats = await fs.stat(mp3Path);
  log("voice", `Voiceover saved (${(stats.size / 1024).toFixed(0)} KB)`);
  return mp3Path;
}
