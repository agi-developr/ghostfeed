import * as fs from "fs/promises";
import * as path from "path";
import { log } from "./ui.js";
import type { ContentMemory, VideoRecord, Script } from "./types.js";

const MEMORY_PATH = path.join("output", "memory.json");

export async function loadMemory(): Promise<ContentMemory> {
  try {
    const data = await fs.readFile(MEMORY_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return { videos: [] };
  }
}

export async function saveVideoRecord(
  niche: string,
  topic: string,
  angle: string,
  script: Script,
  outputPath: string,
): Promise<VideoRecord> {
  const memory = await loadMemory();

  const record: VideoRecord = {
    id: `vid_${Date.now()}`,
    timestamp: new Date().toISOString(),
    niche,
    topic,
    angle,
    script,
    outputPath,
    mockEngagement: generateMockEngagement(script),
  };

  memory.videos.push(record);
  await fs.mkdir(path.dirname(MEMORY_PATH), { recursive: true });
  await fs.writeFile(MEMORY_PATH, JSON.stringify(memory, null, 2));

  log(
    "memory",
    `Saved record: ${record.id} (${memory.videos.length} total videos)`,
  );
  return record;
}

function generateMockEngagement(script: Script) {
  // Simulate engagement based on script quality signals
  const hasStrongHook = script.hook.length > 10;
  const goodLength =
    script.totalDurationSec >= 30 && script.totalDurationSec <= 50;
  const baseViews = 1000 + Math.floor(Math.random() * 9000);
  const multiplier = (hasStrongHook ? 2 : 1) * (goodLength ? 1.5 : 1);

  return {
    views: Math.floor(baseViews * multiplier),
    likes: Math.floor(baseViews * multiplier * (0.03 + Math.random() * 0.07)),
    retention: Math.round((40 + Math.random() * 40) * 100) / 100,
  };
}

export async function getInsights(memory: ContentMemory): Promise<string> {
  if (memory.videos.length === 0) return "No past data yet.";

  const avgRetention =
    memory.videos.reduce((sum, v) => sum + v.mockEngagement.retention, 0) /
    memory.videos.length;
  const bestVideo = memory.videos.reduce((best, v) =>
    v.mockEngagement.retention > best.mockEngagement.retention ? v : best,
  );
  const worstVideo = memory.videos.reduce((worst, v) =>
    v.mockEngagement.retention < worst.mockEngagement.retention ? v : worst,
  );

  return [
    `Total videos: ${memory.videos.length}`,
    `Avg retention: ${avgRetention.toFixed(1)}%`,
    `Best performer: "${bestVideo.topic}" (${bestVideo.mockEngagement.retention}% retention)`,
    `Worst performer: "${worstVideo.topic}" (${worstVideo.mockEngagement.retention}% retention)`,
    `Learning: Prefer angles similar to "${bestVideo.angle}"`,
  ].join("\n");
}
