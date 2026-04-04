import { z } from "zod";

export const GenerateScriptInput = z.object({
  niche: z.string().min(1).max(50),
  config: z
    .object({
      tone: z.string().max(200).optional(),
      aesthetic: z.string().max(200).optional(),
      structure: z
        .enum([
          "standard",
          "problem-mechanism-action",
          "myth-bust",
          "patient-journey",
        ])
        .optional(),
      segments: z.number().int().min(2).max(10).optional(),
      durationSec: z.number().int().min(15).max(120).optional(),
    })
    .optional(),
});

export const ProduceVideoInput = z.object({
  script: z.object({
    title: z.string(),
    hook: z.string(),
    segments: z.array(
      z.object({
        text: z.string(),
        visualPrompt: z.string(),
        durationSec: z.number(),
      }),
    ),
    cta: z.string(),
    totalDurationSec: z.number(),
  }),
  niche: z.string().min(1).max(50).optional(),
  config: z
    .object({
      voice: z.string().optional(),
      imageModel: z.enum(["flux-schnell", "flux-dev"]).optional(),
      captionFontSize: z.number().optional(),
      fadeDuration: z.number().optional(),
      crf: z.number().optional(),
    })
    .optional(),
});

export type GenerateScriptPayload = z.infer<typeof GenerateScriptInput>;
export type ProduceVideoPayload = z.infer<typeof ProduceVideoInput>;
