/**
 * Publisher orchestrator — post a finished video to enabled platforms
 */

import { postToTikTok, generateHashtags, type TikTokPublisher } from "./tiktok.js";
import { postToYouTube, buildYouTubeTags, type YouTubePublisher } from "./youtube.js";

export interface PublishConfig {
  tiktok?: TikTokPublisher;
  youtube?: YouTubePublisher;
}

export interface PublishResult {
  platform: string;
  url?: string;
  publishId?: string;
  error?: string;
}

export async function publishVideo(
  videoPath: string,
  niche: string,
  title: string,
  config: PublishConfig,
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];

  if (config.tiktok) {
    try {
      const result = await postToTikTok(config.tiktok, videoPath, {
        title,
        hashtags: generateHashtags(niche, title),
        privacyLevel: "PUBLIC_TO_EVERYONE",
      });
      results.push({ platform: "tiktok", publishId: result.publishId });
      console.log(`✅ TikTok: published (${result.publishId})`);
    } catch (err: any) {
      results.push({ platform: "tiktok", error: err.message });
      console.error(`❌ TikTok: ${err.message}`);
    }
  }

  if (config.youtube) {
    try {
      const result = await postToYouTube(config.youtube, videoPath, {
        title,
        tags: buildYouTubeTags(niche),
        privacyStatus: "public",
      });
      results.push({ platform: "youtube", url: result.url });
      console.log(`✅ YouTube Shorts: ${result.url}`);
    } catch (err: any) {
      results.push({ platform: "youtube", error: err.message });
      console.error(`❌ YouTube: ${err.message}`);
    }
  }

  return results;
}
