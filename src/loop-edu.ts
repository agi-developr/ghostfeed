import type { NicheConfig } from "./types.js";
import type {
  EducationalStructure,
  KnowledgeContext,
} from "./agents/educator.js";
import { generateEducationalScript } from "./agents/educator.js";
import { generateImages } from "./forge/visuals.js";
import { generateVoiceover } from "./forge/voice.js";
import { generateCaptions } from "./forge/captions.js";
import { assembleVideo } from "./forge/assembler.js";
import { saveVideoRecord } from "./memory.js";
import { log, header, divider } from "./ui.js";
import * as path from "path";

export async function runEducational(
  niche: NicheConfig,
  topic: string,
  structure: EducationalStructure,
  knowledge: KnowledgeContext,
): Promise<string> {
  const startTime = Date.now();

  header(`GhostFeed — Educational Mode`);
  log("info", `Topic: ${topic}`);
  log("info", `Structure: ${structure}`);
  log("info", `Knowledge facts: ${knowledge.facts.length}`);

  // Step 1: Generate educational script
  divider();
  header("Phase 1: Educational Script");
  const script = await generateEducationalScript(
    topic,
    structure,
    knowledge,
    niche,
  );

  // Print the script
  divider();
  log("info", `Title: "${script.title}"`);
  log("info", `Hook: "${script.hook}"`);
  for (let i = 0; i < script.segments.length; i++) {
    log(
      "info",
      `  Segment ${i + 1}: ${script.segments[i].text.slice(0, 100)}...`,
    );
  }
  log("info", `CTA: "${script.cta}"`);
  if (script.keyLearnings?.length) {
    log("info", `Key learnings:`);
    script.keyLearnings.forEach((l) => log("info", `  - ${l}`));
  }

  // Step 2: Generate assets in parallel
  divider();
  header("Phase 2: Asset Generation");
  const runDir = path.join("output", `edu_${Date.now()}`);

  const fullNarration = [
    script.hook,
    ...script.segments.map((s) => s.text),
    script.cta,
  ].join(" ");

  const [images, voiceover] = await Promise.all([
    generateImages(script.segments, runDir),
    generateVoiceover(fullNarration, runDir),
  ]);

  // Step 3: Captions
  const captions = await generateCaptions(script, runDir);

  // Step 4: Assemble
  divider();
  header("Phase 3: Video Assembly");
  const videoPath = await assembleVideo(
    images,
    voiceover,
    captions,
    script,
    runDir,
  );

  // Step 5: Save to memory
  divider();
  header("Phase 4: Memory Update");
  const record = await saveVideoRecord(
    niche.name,
    topic,
    structure,
    script,
    videoPath,
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  divider();
  header("Educational Video Complete");
  log("done", `Video: ${videoPath}`);
  log("done", `Time: ${elapsed}s`);
  log("done", `Structure: ${script.structure}`);
  if (script.sources?.length) {
    log("done", `Sources: ${script.sources.join(", ")}`);
  }

  return videoPath;
}
