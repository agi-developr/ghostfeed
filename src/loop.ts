import type { NicheConfig, RunConfig } from "./types.js";
import { scoutTrends } from "./agents/trend-scout.js";
import { pickBestTrend } from "./agents/strategist.js";
import { writeScript } from "./agents/script-writer.js";
import { generateImages } from "./forge/visuals.js";
import { generateVoiceover } from "./forge/voice.js";
import { generateCaptions } from "./forge/captions.js";
import { assembleVideo } from "./forge/assembler.js";
import { loadMemory, saveVideoRecord, getInsights } from "./memory.js";
import { log, header, divider } from "./ui.js";
import { publishVideo, type PublishConfig } from "./publishers/index.js";
import * as path from "path";

export async function runOnce(
  niche: NicheConfig,
  config?: RunConfig,
  publish?: PublishConfig,
): Promise<string> {
  const startTime = Date.now();
  const memory = await loadMemory();

  header(`GhostFeed — Autonomous Content Cycle`);
  log("info", `Niche: ${niche.name} | Past videos: ${memory.videos.length}`);

  if (memory.videos.length > 0) {
    divider();
    log("memory", "Learning from past performance:");
    console.log(await getInsights(memory));
  }

  // Step 1: Scout trends
  divider();
  header("Phase 1: Trend Discovery");
  const trends = await scoutTrends(niche, memory.videos);

  // Step 2: Pick best trend
  divider();
  header("Phase 2: Strategic Selection");
  const { selected, reasoning } = await pickBestTrend(
    trends,
    memory.videos,
    niche.name,
  );

  // Apply tone/aesthetic overrides from config
  if (config?.tone) niche = { ...niche, tone: config.tone };
  if (config?.aesthetic) niche = { ...niche, aesthetic: config.aesthetic };

  // Step 3: Write script
  divider();
  header("Phase 3: Script Generation");
  const script = await writeScript(selected, niche, {
    structure: config?.structure,
    segments: config?.segments,
    durationSec: config?.durationSec,
  });

  // Print the script for demo visibility
  divider();
  log("info", `Script: "${script.title}"`);
  log("info", `Hook: "${script.hook}"`);
  for (let i = 0; i < script.segments.length; i++) {
    log(
      "info",
      `  Segment ${i + 1}: ${script.segments[i].text.slice(0, 80)}...`,
    );
  }
  log("info", `CTA: "${script.cta}"`);

  // Step 4: Generate assets (images + voice in parallel)
  divider();
  header("Phase 4: Asset Generation");
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

  // Step 5: Generate captions
  const captions = await generateCaptions(
    script,
    runDir,
    config?.captionFontSize,
  );

  // Step 6: Assemble video
  divider();
  header("Phase 5: Video Assembly");
  const videoPath = await assembleVideo(
    images,
    voiceover,
    captions,
    script,
    runDir,
    { fadeDuration: config?.fadeDuration, crf: config?.crf },
  );

  // Step 7: Save to memory
  divider();
  header("Phase 6: Memory Update");
  const record = await saveVideoRecord(
    niche.name,
    selected.topic,
    selected.angle,
    script,
    videoPath,
  );

  // Step 8: Auto-publish (if configured)
  if (publish && (publish.tiktok || publish.youtube)) {
    divider();
    header("Phase 7: Publishing");
    const publishResults = await publishVideo(
      videoPath,
      niche.name,
      script.title,
      publish,
    );
    for (const r of publishResults) {
      if (r.error) {
        log("error", `${r.platform}: ${r.error}`);
      } else {
        log("done", `${r.platform}: ${r.url ?? r.publishId}`);
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  divider();
  header("Cycle Complete");
  log("done", `Video: ${videoPath}`);
  log("done", `Time: ${elapsed}s`);
  log(
    "done",
    `Mock engagement: ${record.mockEngagement.views} views, ${record.mockEngagement.retention}% retention`,
  );
  log("done", `Total videos produced: ${(await loadMemory()).videos.length}`);

  return videoPath;
}

export async function runLoop(
  niche: NicheConfig,
  intervalMin: number = 5,
  publish?: PublishConfig,
): Promise<void> {
  log("loop", `Starting autonomous loop (every ${intervalMin} min)`);

  // Auto-detect publish config from env if not passed
  const resolvedPublish: PublishConfig = publish ?? {
    tiktok: process.env.TIKTOK_ACCESS_TOKEN
      ? { accessToken: process.env.TIKTOK_ACCESS_TOKEN }
      : undefined,
    youtube: process.env.YOUTUBE_ACCESS_TOKEN
      ? { accessToken: process.env.YOUTUBE_ACCESS_TOKEN }
      : undefined,
  };

  while (true) {
    try {
      await runOnce(niche, undefined, resolvedPublish);
    } catch (err: any) {
      log("error", `Cycle failed: ${err.message}`);
    }

    log("loop", `Next cycle in ${intervalMin} minutes...`);
    await new Promise((resolve) =>
      setTimeout(resolve, intervalMin * 60 * 1000),
    );
  }
}
