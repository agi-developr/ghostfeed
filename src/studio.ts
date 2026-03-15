import type { NicheConfig, RunConfig, Trend, Script } from "./types.js";
import { scoutTrends } from "./agents/trend-scout.js";
import { pickBestTrend } from "./agents/strategist.js";
import { writeScript } from "./agents/script-writer.js";
import { generateImages } from "./forge/visuals.js";
import { generateVoiceover } from "./forge/voice.js";
import { generateCaptions } from "./forge/captions.js";
import { assembleVideo } from "./forge/assembler.js";
import { saveVideoRecord, loadMemory } from "./memory.js";
import { log } from "./ui.js";
import * as path from "path";

export async function generateScriptOnly(
  niche: NicheConfig,
  config?: RunConfig,
): Promise<{ trend: Trend; script: Script }> {
  // Apply tone/aesthetic overrides from config
  if (config?.tone) niche = { ...niche, tone: config.tone };
  if (config?.aesthetic) niche = { ...niche, aesthetic: config.aesthetic };

  const memory = await loadMemory();

  log("studio", "Phase 1: Generating script...");
  const trends = await scoutTrends(niche, memory.videos);
  const { selected } = await pickBestTrend(trends, memory.videos, niche.name);
  const script = await writeScript(selected, niche, {
    structure: config?.structure,
    segments: config?.segments,
    durationSec: config?.durationSec,
  });

  return { trend: selected, script };
}

export async function generateFromScript(
  script: Script,
  niche: NicheConfig,
  config?: RunConfig,
): Promise<string> {
  log("studio", "Phase 2: Producing video from script...");
  const runDir = path.join("output", `run_${Date.now()}`);

  const fullNarration = [
    script.hook,
    ...script.segments.map((s) => s.text),
    script.cta,
  ].join(" ");

  const [images, voiceover] = await Promise.all([
    generateImages(script.segments, runDir, config?.imageModel),
    generateVoiceover(fullNarration, runDir, config?.voice),
  ]);

  const captions = await generateCaptions(
    script,
    runDir,
    config?.captionFontSize,
  );

  const videoPath = await assembleVideo(
    images,
    voiceover,
    captions,
    script,
    runDir,
    { fadeDuration: config?.fadeDuration, crf: config?.crf },
  );

  await saveVideoRecord(
    niche.name,
    script.title,
    script.hook,
    script,
    videoPath,
  );

  return videoPath;
}

// Re-generate a single image for a segment
export async function regenerateImage(
  _segmentIndex: number,
  visualPrompt: string,
  runDir: string,
  imageModel?: string,
): Promise<string> {
  const segment = { text: "", visualPrompt, durationSec: 8 };
  const results = await generateImages([segment], runDir, imageModel);
  return results[0];
}

// Re-generate voiceover with a different voice
export async function regenerateVoice(
  script: Script,
  runDir: string,
  voice?: string,
): Promise<string> {
  const fullNarration = [
    script.hook,
    ...script.segments.map((s) => s.text),
    script.cta,
  ].join(" ");
  return generateVoiceover(fullNarration, runDir, voice);
}

// Reassemble video with existing assets
export async function reassembleVideo(
  images: string[],
  voiceover: string,
  script: Script,
  runDir: string,
  config?: RunConfig,
): Promise<string> {
  const captions = await generateCaptions(
    script,
    runDir,
    config?.captionFontSize,
  );
  return assembleVideo(images, voiceover, captions, script, runDir, {
    fadeDuration: config?.fadeDuration,
    crf: config?.crf,
  });
}
