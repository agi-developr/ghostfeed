import "dotenv/config";

if (!process.env.NEBIUS_API_KEY) {
  console.error(
    "\n  ERROR: NEBIUS_API_KEY not set.\n  Create a .env file with: NEBIUS_API_KEY=your_key_here\n",
  );
  process.exit(1);
}

export const config = {
  nebius: {
    apiKey: process.env.NEBIUS_API_KEY,
    baseUrl: "https://api.tokenfactory.nebius.com/v1/",
    model: "Qwen/Qwen3-235B-A22B-Instruct-2507",
    imageModel: "black-forest-labs/flux-schnell",
  },
  defaults: {
    niche: "stoic philosophy",
    videoDurationSec: 45,
    segmentsPerVideo: 5,
    outputDir: "output",
  },
};
