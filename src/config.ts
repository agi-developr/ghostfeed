import "dotenv/config";

export const config = {
  nebius: {
    apiKey: process.env.NEBIUS_API_KEY!,
    baseUrl: "https://api.tokenfactory.nebius.com/v1/",
    model: "Qwen/Qwen3-235B-A22B-Instruct-2507",
    imageModel: "black-forest-labs/flux-schnell",
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY!,
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - clear, professional
  },
  defaults: {
    niche: "stoic philosophy",
    videoDurationSec: 45,
    segmentsPerVideo: 5,
    outputDir: "output",
  },
};
