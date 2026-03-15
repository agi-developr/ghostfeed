import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.NEBIUS_API_KEY,
  baseURL: "https://api.tokenfactory.nebius.com/v1/",
});

async function main() {
  console.log("Testing Nebius LLM (Qwen3-235B)...");
  const res = await client.chat.completions.create({
    model: "Qwen/Qwen3-235B-A22B-Instruct-2507",
    messages: [{ role: "user", content: "Say hello in 5 words" }],
    max_tokens: 50,
  });
  console.log("LLM OK:", res.choices[0]?.message?.content);

  console.log("\nTesting Nebius Flux image gen...");
  const img = await client.images.generate({
    model: "black-forest-labs/flux-schnell",
    prompt:
      "A dark marble statue of Marcus Aurelius, dramatic cinematic lighting, moody atmosphere",
    n: 1,
    size: "1024x1024",
    response_format: "b64_json",
  });
  const b64 = img.data?.[0]?.b64_json;
  if (b64) {
    const { writeFileSync } = await import("fs");
    writeFileSync("output/test_image.png", Buffer.from(b64, "base64"));
    console.log(
      "Image OK: saved to output/test_image.png (" +
        Math.round(b64.length / 1024) +
        " KB b64)",
    );
  } else {
    console.log("Image FAIL: no b64 data", JSON.stringify(img));
  }
}

main().catch((e) => {
  console.error("ERR:", e.message);
  if (e.response) console.error("Status:", e.response.status);
});
