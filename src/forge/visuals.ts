import { nebius } from "../llm.js";
import { config } from "../config.js";
import { log } from "../ui.js";
import type { ScriptSegment } from "../types.js";
import * as fs from "fs/promises";
import * as path from "path";

export async function generateImages(
  segments: ScriptSegment[],
  outputDir: string,
): Promise<string[]> {
  log("visual", `Generating ${segments.length} images via Flux Schnell...`);
  await fs.mkdir(outputDir, { recursive: true });

  const paths: string[] = [];

  // Generate images in parallel for speed
  const promises = segments.map(async (seg, i) => {
    const imgPath = path.join(outputDir, `segment_${i}.png`);

    const response = await nebius.images.generate({
      model: config.nebius.imageModel,
      prompt: seg.visualPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const b64 = response.data[0]?.b64_json;
    if (!b64) throw new Error(`No image data for segment ${i}`);

    await fs.writeFile(imgPath, Buffer.from(b64, "base64"));
    log("visual", `Image ${i + 1}/${segments.length} saved`);
    return imgPath;
  });

  const results = await Promise.all(promises);
  paths.push(...results);

  log("visual", `All ${paths.length} images generated`);
  return paths;
}
