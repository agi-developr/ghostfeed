import { chatJSON } from "../llm.js";
import type { Trend, Script, NicheConfig } from "../types.js";
import { log } from "../ui.js";

const SYSTEM = `You are ScriptWriter, an elite TikTok/Shorts scriptwriter AI.

You write scripts optimized for MAXIMUM RETENTION on short-form video.

Rules:
- First 3 seconds = HOOK. Must stop the scroll. Use: shocking stat, contrarian claim, direct question, or "Most people don't know..."
- Pattern interrupt every 5-7 seconds (new visual, tone shift, rhetorical question)
- Open loop early → payoff at the end (keeps viewers watching)
- CTA at the end (follow, comment, share)
- Total duration: 30-60 seconds when read at natural pace
- Split into 4-6 segments, each ~8-12 seconds
- Each segment needs a visual description for AI image generation

Return JSON with the full script structure.`;

export async function writeScript(
  trend: Trend,
  niche: NicheConfig,
): Promise<Script> {
  log("writer", `Writing script: "${trend.topic}" — ${trend.angle}`);

  const result = await chatJSON<Script>(
    SYSTEM,
    `Niche: ${niche.name}
Tone: ${niche.tone}
Aesthetic: ${niche.aesthetic}
Topic: ${trend.topic}
Angle: ${trend.angle}

Write a 30-50 second TikTok script. Return JSON:
{
  "title": "video title for posting",
  "hook": "the first 3 seconds — must stop the scroll",
  "segments": [
    {
      "text": "narration text for this segment",
      "visualPrompt": "detailed prompt for AI image generation — describe the exact scene, style: ${niche.aesthetic}, high quality, vertical 9:16",
      "durationSec": 8
    }
  ],
  "cta": "call to action at the end",
  "totalDurationSec": 45
}

Make the visual prompts SPECIFIC and consistent in style. Each image should be distinct but feel like part of the same video.`,
  );

  log(
    "writer",
    `Script ready: "${result.title}" (${result.segments.length} segments, ~${result.totalDurationSec}s)`,
  );
  return result;
}
