/**
 * TikTok Content Posting API v2
 * Docs: https://developers.tiktok.com/doc/content-posting-api-get-started
 *
 * Flow:
 * 1. POST /v2/post/publish/video/init/ → get upload_url + publish_id
 * 2. PUT chunks to upload_url
 * 3. Poll /v2/post/publish/status/fetch/ until complete
 */

import * as fs from "fs";
import * as path from "path";

const TIKTOK_API = "https://open.tiktokapis.com/v2";
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

export interface TikTokPostOptions {
  title: string;
  privacyLevel?: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "SELF_ONLY";
  disableComment?: boolean;
  disableDuet?: boolean;
  disableStitch?: boolean;
  hashtags?: string[];
}

export interface TikTokPublisher {
  accessToken: string;
}

export async function postToTikTok(
  publisher: TikTokPublisher,
  videoPath: string,
  options: TikTokPostOptions,
): Promise<{ publishId: string; status: string }> {
  const stat = fs.statSync(videoPath);
  const videoSize = stat.size;
  const totalChunks = Math.ceil(videoSize / CHUNK_SIZE);

  // Build caption with hashtags
  let title = options.title;
  if (options.hashtags?.length) {
    title += " " + options.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ");
  }
  // TikTok title max 2200 chars
  if (title.length > 2200) title = title.slice(0, 2197) + "...";

  // Step 1: Init upload
  const initRes = await fetch(`${TIKTOK_API}/post/publish/video/init/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${publisher.accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title,
        privacy_level: options.privacyLevel ?? "PUBLIC_TO_EVERYONE",
        disable_comment: options.disableComment ?? false,
        disable_duet: options.disableDuet ?? false,
        disable_stitch: options.disableStitch ?? false,
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: videoSize,
        chunk_size: CHUNK_SIZE,
        total_chunk_count: totalChunks,
      },
    }),
  });

  const initData = await initRes.json();
  if (!initRes.ok || initData.error?.code !== "ok") {
    throw new Error(
      `TikTok init failed: ${JSON.stringify(initData.error ?? initData)}`,
    );
  }

  const { publish_id, upload_url } = initData.data;

  // Step 2: Upload chunks
  const fileBuffer = fs.readFileSync(videoPath);
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, videoSize);
    const chunk = fileBuffer.slice(start, end);

    const uploadRes = await fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Range": `bytes ${start}-${end - 1}/${videoSize}`,
        "Content-Length": String(chunk.length),
        "Content-Type": "video/mp4",
      },
      body: chunk,
    });

    if (!uploadRes.ok && uploadRes.status !== 206) {
      throw new Error(`TikTok chunk ${i + 1}/${totalChunks} upload failed: ${uploadRes.status}`);
    }
  }

  // Step 3: Poll status
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise((r) => setTimeout(r, 3000));

    const statusRes = await fetch(`${TIKTOK_API}/post/publish/status/fetch/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${publisher.accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ publish_id }),
    });

    const statusData = await statusRes.json();
    const status = statusData.data?.status;

    if (status === "PUBLISH_COMPLETE") {
      return { publishId: publish_id, status: "published" };
    }
    if (status === "FAILED") {
      throw new Error(`TikTok publish failed: ${JSON.stringify(statusData.data)}`);
    }
    // PROCESSING_UPLOAD or PROCESSING_DOWNLOAD — keep polling
  }

  throw new Error("TikTok publish timed out after 90s");
}

/**
 * Generate smart hashtags from niche + script title
 */
export function generateHashtags(niche: string, title: string): string[] {
  const nicheHashtags: Record<string, string[]> = {
    stoic: ["stoicism", "stoic", "marcusaurelius", "philosophy", "mindset", "mentalstrength"],
    ai: ["ai", "artificialintelligence", "chatgpt", "technology", "future", "automation"],
    productivity: ["productivity", "habits", "focus", "deepwork", "timemanagement", "selfimprovement"],
    psychology: ["psychology", "mindset", "behavior", "influence", "darkpsychology", "mentalhealth"],
    money: ["investing", "wealth", "financialfreedom", "money", "passiveincome", "finance"],
    "gut health": ["guthealth", "sibo", "microbiome", "ibs", "digestivehealth", "wellness"],
  };

  const base = nicheHashtags[niche.toLowerCase()] ?? ["viral", "trending", "fyp"];
  return [...base, "fyp", "foryou", "viral"].slice(0, 8);
}
