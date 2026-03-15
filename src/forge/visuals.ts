import { config } from "../config.js";
import { log } from "../ui.js";
import type { ScriptSegment } from "../types.js";
import * as fs from "fs/promises";
import * as path from "path";

const DEFAULT_IMAGE_MODEL = "black-forest-labs/flux-schnell";
const IMAGE_WIDTH = 768;
const IMAGE_HEIGHT = 1344; // ~9:16 vertical

export async function generateImages(
  segments: ScriptSegment[],
  outputDir: string,
  imageModel?: string,
): Promise<string[]> {
  const IMAGE_MODEL = imageModel || DEFAULT_IMAGE_MODEL;
  log(
    "visual",
    `Generating ${segments.length} images via ${IMAGE_MODEL} (${IMAGE_WIDTH}x${IMAGE_HEIGHT})...`,
  );
  await fs.mkdir(outputDir, { recursive: true });

  const promises = segments.map(async (seg, i) => {
    const imgPath = path.join(outputDir, `segment_${i}.webp`);

    const response = await fetch(`${config.nebius.baseUrl}images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.nebius.apiKey}`,
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt: seg.visualPrompt,
        n: 1,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        response_format: "b64_json",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(
        `Image gen failed for segment ${i}: ${response.status} ${err.slice(0, 200)}`,
      );
    }

    const data = (await response.json()) as any;
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) throw new Error(`No image data for segment ${i}`);

    await fs.writeFile(imgPath, Buffer.from(b64, "base64"));
    log("visual", `Image ${i + 1}/${segments.length} saved`);
    return imgPath;
  });

  const results = await Promise.all(promises);
  log("visual", `All ${results.length} images generated`);
  return results;
}
