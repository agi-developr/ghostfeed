import { chatJSON } from "../llm.js";
import type { Trend, Script, NicheConfig } from "../types.js";
import { log } from "../ui.js";

export interface ScriptOpts {
  structure?: string;
  segments?: number;
  durationSec?: number;
}

const STRUCTURE_PROMPTS: Record<string, string> = {
  "problem-mechanism-action":
    "Structure: Start with a relatable PROBLEM, explain the hidden MECHANISM behind it, then give a clear ACTION step.",
  "myth-bust":
    "Structure: Open with a common myth or misconception, debunk it with surprising facts, then reveal the truth.",
  "patient-journey":
    "Structure: Tell a personal story arc — the struggle, the turning point, and the transformation.",
};

function buildSystem(opts?: ScriptOpts): string {
  const duration = opts?.durationSec ?? 45;
  const segments = opts?.segments ?? 5;
  const structureHint =
    opts?.structure && STRUCTURE_PROMPTS[opts.structure]
      ? `\n- ${STRUCTURE_PROMPTS[opts.structure]}`
      : "";

  return `You are ScriptWriter, an elite TikTok/Shorts scriptwriter AI.

You write scripts optimized for MAXIMUM RETENTION on short-form video.

Rules:
- First 3 seconds = HOOK. Must stop the scroll. Use: shocking stat, contrarian claim, direct question, or "Most people don't know..."
- Pattern interrupt every 5-7 seconds (new visual, tone shift, rhetorical question)
- Open loop early → payoff at the end (keeps viewers watching)
- CTA at the end (follow, comment, share)
- Total duration: ~${duration} seconds when read at natural pace
- Split into ${segments} segments, each ~${Math.round(duration / segments)} seconds
- Each segment needs a visual description for AI image generation${structureHint}

Return JSON with the full script structure.`;
}

export async function writeScript(
  trend: Trend,
  niche: NicheConfig,
  opts?: ScriptOpts,
): Promise<Script> {
  log("writer", `Writing script: "${trend.topic}" — ${trend.angle}`);

  const duration = opts?.durationSec ?? 45;
  const segments = opts?.segments ?? 5;

  const result = await chatJSON<Script>(
    buildSystem(opts),
    `Niche: ${niche.name}
Tone: ${niche.tone}
Aesthetic: ${niche.aesthetic}
Topic: ${trend.topic}
Angle: ${trend.angle}

Write a ~${duration} second TikTok script with ${segments} segments. Return JSON:
{
  "title": "video title for posting",
  "hook": "the first 3 seconds — must stop the scroll",
  "segments": [
    {
      "text": "narration text for this segment",
      "visualPrompt": "detailed prompt for AI image generation — describe the exact scene, style: ${niche.aesthetic}, high quality, vertical 9:16",
      "durationSec": ${Math.round(duration / segments)}
    }
  ],
  "cta": "call to action at the end",
  "totalDurationSec": ${duration}
}

Make the visual prompts SPECIFIC and consistent in style. Each image should be distinct but feel like part of the same video.`,
  );

  log(
    "writer",
    `Script ready: "${result.title}" (${result.segments.length} segments, ~${result.totalDurationSec}s)`,
  );
  return result;
}
