import { execFile } from "child_process";
import { promisify } from "util";
import { log } from "../ui.js";
import * as fs from "fs/promises";
import * as path from "path";

const execFileAsync = promisify(execFile);

// Microsoft Edge Neural TTS — free, no API key, near-human quality
const DEFAULT_VOICE = "en-US-ChristopherNeural"; // Reliable, Authority

export async function generateVoiceover(
  text: string,
  outputDir: string,
  voice?: string,
): Promise<string> {
  const VOICE = voice || DEFAULT_VOICE;
  log("voice", `Generating voiceover via Edge Neural TTS (${VOICE})...`);
  await fs.mkdir(outputDir, { recursive: true });

  const mp3Path = path.join(outputDir, "voiceover.mp3");

  await execFileAsync(
    "edge-tts",
    ["--voice", VOICE, "--text", text, "--write-media", mp3Path],
    { timeout: 60000, maxBuffer: 10 * 1024 * 1024 },
  );

  const stats = await fs.stat(mp3Path);
  log("voice", `Voiceover saved (${(stats.size / 1024).toFixed(0)} KB)`);
  return mp3Path;
}
