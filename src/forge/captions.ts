import type { Script } from "../types.js";
import { log } from "../ui.js";
import * as fs from "fs/promises";
import * as path from "path";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

export async function generateCaptions(
  script: Script,
  outputDir: string,
  fontSize?: number,
): Promise<string> {
  const FONT_SIZE = fontSize ?? 80;
  log("caption", `Generating captions (ASS format, ${FONT_SIZE}pt)...`);
  await fs.mkdir(outputDir, { recursive: true });
  const outPath = path.join(outputDir, "captions.ass");

  // ASS header with TikTok-style bold centered captions
  let ass = `[Script Info]
Title: GhostFeed Captions
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial Black,${FONT_SIZE},&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,2,5,40,40,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  let currentTime = 0;

  // Add hook as first caption
  const hookEnd = Math.min(3, script.segments[0]?.durationSec ?? 3);
  ass += `Dialogue: 0,${formatTime(0)},${formatTime(hookEnd)},Default,,0,0,0,,${escapeASS(script.hook)}\n`;
  currentTime = hookEnd;

  // Add each segment
  for (const seg of script.segments) {
    // Split long text into chunks of ~8 words for readability
    const words = seg.text.split(" ");
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += 7) {
      chunks.push(words.slice(i, i + 7).join(" "));
    }

    const chunkDuration = seg.durationSec / chunks.length;
    for (const chunk of chunks) {
      const end = currentTime + chunkDuration;
      ass += `Dialogue: 0,${formatTime(currentTime)},${formatTime(end)},Default,,0,0,0,,${escapeASS(chunk)}\n`;
      currentTime = end;
    }
  }

  // Add CTA as final caption (estimated 4s)
  if (script.cta) {
    const ctaEnd = currentTime + 4;
    ass += `Dialogue: 0,${formatTime(currentTime)},${formatTime(ctaEnd)},Default,,0,0,0,,${escapeASS(script.cta)}\n`;
  }

  await fs.writeFile(outPath, ass);
  log("caption", `Captions saved (${script.segments.length} segments)`);
  return outPath;
}

function escapeASS(text: string): string {
  return text.replace(/\n/g, "\\N");
}
