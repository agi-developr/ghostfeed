import { chatJSON } from "../llm.js";
import type { Trend, VideoRecord } from "../types.js";
import { log } from "../ui.js";

const SYSTEM = `You are ContentStrategist, an AI that picks the BEST content opportunity from a list of trends.

You consider:
- Viral potential (hook strength, shareability)
- Niche fit (on-brand)
- Novelty (haven't done similar content recently)
- Production feasibility (can be made with AI images + voiceover)
- Retention potential (will people watch to the end?)

Return JSON with the selected trend and your reasoning.`;

export async function pickBestTrend(
  trends: Trend[],
  pastVideos: VideoRecord[],
  niche: string,
): Promise<{ selected: Trend; reasoning: string }> {
  log("strategist", "Evaluating trends...");

  const pastAngles = pastVideos.slice(-10).map((v) => ({
    topic: v.topic,
    angle: v.angle,
    retention: v.mockEngagement.retention,
  }));

  const result = await chatJSON<{
    selected: Trend;
    reasoning: string;
  }>(
    SYSTEM,
    `Niche: ${niche}
Available trends:
${JSON.stringify(trends, null, 2)}

Past content performance:
${JSON.stringify(pastAngles, null, 2)}

Pick the single best trend to produce next. Return:
{
  "selected": { "topic": "...", "angle": "...", "whyNow": "...", "viralScore": N },
  "reasoning": "why this one wins"
}`,
  );

  log(
    "strategist",
    `Selected: "${result.selected.topic}" — ${result.reasoning}`,
  );
  return result;
}
