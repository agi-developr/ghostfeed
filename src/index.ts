import { program } from "commander";
import type { NicheConfig, RunConfig } from "./types.js";
import { runOnce, runLoop } from "./loop.js";
import { runEducational } from "./loop-edu.js";
import { gutHealthNiche, gutHealthTopics } from "./niches/gut-health.js";
import { header, log } from "./ui.js";

const PRESET_NICHES: Record<string, NicheConfig> = {
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

program
  .name("ghostfeed")
  .description("Autonomous AI agent that runs faceless content channels")
  .version("0.1.0");

program
  .command("run")
  .description("Run one content generation cycle")
  .option(
    "-n, --niche <niche>",
    "Niche preset (stoic|productivity|ai|psychology|money)",
    "stoic",
  )
  .option("--custom-niche <name>", "Custom niche name")
  .option("--config <json>", "RunConfig JSON overrides")
  .action(async (opts) => {
    const niche = opts.customNiche
      ? createCustomNiche(opts.customNiche)
      : (PRESET_NICHES[opts.niche] ?? PRESET_NICHES.stoic);

    let parsedConfig: RunConfig | undefined;
    if (opts.config) {
      parsedConfig = JSON.parse(opts.config) as RunConfig;
      if (parsedConfig.tone) niche.tone = parsedConfig.tone;
      if (parsedConfig.aesthetic) niche.aesthetic = parsedConfig.aesthetic;
    }

    printBanner();
    await runOnce(niche, parsedConfig);
  });

program
  .command("loop")
  .description("Run autonomous content loop")
  .option("-n, --niche <niche>", "Niche preset", "stoic")
  .option("-i, --interval <min>", "Minutes between cycles", "5")
  .action(async (opts) => {
    const niche = PRESET_NICHES[opts.niche] ?? PRESET_NICHES.stoic;
    printBanner();
    await runLoop(niche, parseInt(opts.interval));
  });

program
  .command("demo")
  .description("Run demo: generates videos across multiple niches")
  .action(async () => {
    printBanner();
    const niches = ["stoic", "ai", "psychology"];
    for (const n of niches) {
      const niche = PRESET_NICHES[n]!;
      log("info", `\n>>> Demo: ${niche.name} <<<`);
      await runOnce(niche);
    }
  });

program
  .command("educate")
  .description("Generate educational content (gut health)")
  .option("-t, --topic <index>", "Topic index (0-5) or 'all'", "0")
  .action(async (opts) => {
    printBanner();
    console.log("  Mode: EDUCATIONAL\n");

    if (opts.topic === "all") {
      for (let i = 0; i < gutHealthTopics.length; i++) {
        const t = gutHealthTopics[i];
        log(
          "info",
          `\n>>> Topic ${i + 1}/${gutHealthTopics.length}: ${t.topic} <<<`,
        );
        await runEducational(gutHealthNiche, t.topic, t.structure, t.knowledge);
      }
    } else {
      const idx = parseInt(opts.topic);
      const t = gutHealthTopics[idx] ?? gutHealthTopics[0];
      await runEducational(gutHealthNiche, t.topic, t.structure, t.knowledge);
    }
  });

program.parse();

function createCustomNiche(name: string): NicheConfig {
  return {
    name,
    keywords: name.split(" "),
    tone: "engaging, informative, slightly provocative",
    aesthetic:
      "clean modern design, bold colors, dramatic lighting, 9:16 vertical",
    avoidTopics: [],
  };
}

function printBanner() {
  header("G H O S T F E E D");
  console.log("  Autonomous AI Content Agent");
  console.log('  "It runs your channel while you sleep."\n');
}
