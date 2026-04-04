import { NextResponse } from "next/server";
import { GenerateScriptInput } from "../../../lib/schemas";

const PRESET_NICHES: Record<string, any> = {
  stoic: {
    name: "stoic philosophy",
    keywords: [
      "stoicism",
      "marcus aurelius",
      "seneca",
      "epictetus",
      "mental strength",
    ],
    tone: "calm, authoritative, wise — like a mentor speaking to you directly",
    aesthetic:
      "dark moody atmosphere, marble statues, ancient Rome, cinematic lighting, dramatic shadows, 9:16 vertical",
    avoidTopics: ["religion", "politics"],
  },
  productivity: {
    name: "productivity tips",
    keywords: [
      "morning routine",
      "focus",
      "deep work",
      "habits",
      "time management",
    ],
    tone: "energetic, practical, slightly contrarian — challenge lazy thinking",
    aesthetic:
      "clean minimalist workspace, bright whites, soft blues, modern design, 9:16 vertical",
    avoidTopics: ["hustle culture", "grindset"],
  },
  ai: {
    name: "AI & technology",
    keywords: [
      "artificial intelligence",
      "ChatGPT",
      "automation",
      "future tech",
      "AGI",
    ],
    tone: "fascinated, slightly ominous, future-gazing — make people think",
    aesthetic:
      "cyberpunk neon, neural networks, futuristic cityscapes, holographic displays, dark background, 9:16 vertical",
    avoidTopics: ["crypto scams", "get rich quick"],
  },
  psychology: {
    name: "dark psychology",
    keywords: [
      "manipulation",
      "persuasion",
      "body language",
      "influence",
      "cognitive bias",
    ],
    tone: "mysterious, revealing — like you're sharing forbidden knowledge",
    aesthetic:
      "dark background, shadowy figures, chess pieces, dramatic lighting, noir aesthetic, 9:16 vertical",
    avoidTopics: ["self-harm", "abuse"],
  },
  money: {
    name: "wealth building",
    keywords: [
      "investing",
      "passive income",
      "financial freedom",
      "money mindset",
      "compound interest",
    ],
    tone: "confident, data-driven, no-BS — cut through the noise",
    aesthetic:
      "luxury minimalism, gold accents on dark, financial charts, city skylines at night, 9:16 vertical",
    avoidTopics: ["crypto gambling", "get rich quick schemes"],
  },
};

function resolveNiche(nicheName: string) {
  if (PRESET_NICHES[nicheName]) return PRESET_NICHES[nicheName];
  return {
    name: nicheName,
    keywords: nicheName.split(" "),
    tone: "engaging, informative, slightly provocative",
    aesthetic:
      "clean modern design, bold colors, dramatic lighting, 9:16 vertical",
    avoidTopics: [],
  };
}

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = GenerateScriptInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { niche, config } = parsed.data;
  const nicheConfig = resolveNiche(niche);

  if (config?.tone) nicheConfig.tone = config.tone;
  if (config?.aesthetic) nicheConfig.aesthetic = config.aesthetic;

  try {
    const { generateScriptOnly } = await import("../../../src/studio");
    const result = await generateScriptOnly(nicheConfig, config);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Script generation failed", message: err.message },
      { status: 500 },
    );
  }
}
