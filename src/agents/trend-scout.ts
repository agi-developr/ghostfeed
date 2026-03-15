import { chatJSON } from "../llm.js";
import type { Trend, NicheConfig, VideoRecord } from "../types.js";
import { log } from "../ui.js";

const SYSTEM = `You are TrendScout, an AI that identifies viral content opportunities.
You analyze what's trending RIGHT NOW in a given niche and find angles that will get views on TikTok/YouTube Shorts.

Focus on:
- Contrarian takes (high engagement)
- Listicles (easy retention)
- "Most people don't know..." hooks
- Timely/seasonal relevance
- Emotional triggers (curiosity, outrage, inspiration)

Return JSON with a "trends" array of 3-5 trending topics.`;

export async function scoutTrends(
  niche: NicheConfig,
  pastVideos: VideoRecord[],
): Promise<Trend[]> {
  log("scout", `Scanning trends for "${niche.name}"...`);

  const pastTopics = pastVideos.map((v) => v.topic).join(", ") || "none yet";

  const result = await chatJSON<{ trends: Trend[] }>(
    SYSTEM,
    `Niche: ${niche.name}
Keywords: ${niche.keywords.join(", ")}
Tone: ${niche.tone}
Avoid topics: ${niche.avoidTopics.join(", ")}
Already covered: ${pastTopics}
Date context: March 2026

Find 3-5 trending topics with viral potential. For each:
{
  "trends": [
    {
      "topic": "specific topic",
      "angle": "the unique angle/hook",
      "whyNow": "why this is timely",
      "viralScore": 8
    }
  ]
}`,
  );

  log(
    "scout",
    `Found ${result.trends.length} trends: ${result.trends.map((t) => t.topic).join(", ")}`,
  );
  return result.trends;
}
