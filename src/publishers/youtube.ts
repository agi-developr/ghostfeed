/**
 * YouTube Data API v3 — upload video as YouTube Short
 * Docs: https://developers.google.com/youtube/v3/guides/uploading_a_video
 *
 * Shorts = vertical video ≤60s with #Shorts in title/description
 */

import * as fs from "fs";

const YT_UPLOAD_API = "https://www.googleapis.com/upload/youtube/v3/videos";
const YT_API = "https://www.googleapis.com/youtube/v3";

export interface YouTubePublisher {
  accessToken: string; // OAuth2 access token
}

export interface YouTubePostOptions {
  title: string;
  description?: string;
  tags?: string[];
  privacyStatus?: "public" | "unlisted" | "private";
  categoryId?: string; // 22 = People & Blogs, 24 = Entertainment
}

export async function postToYouTube(
  publisher: YouTubePublisher,
  videoPath: string,
  options: YouTubePostOptions,
): Promise<{ videoId: string; url: string }> {
  const stat = fs.statSync(videoPath);
  const videoSize = stat.size;

  // Add #Shorts to make it a Short
  const title = options.title.includes("#Shorts")
    ? options.title
    : `${options.title} #Shorts`;

  const description = [
    options.description ?? "",
    "",
    "#Shorts",
    ...(options.tags?.map((t) => `#${t.replace(/^#/, "")}`) ?? []),
  ]
    .join("\n")
    .slice(0, 5000);

  // Step 1: Initiate resumable upload
  const initRes = await fetch(
    `${YT_UPLOAD_API}?uploadType=resumable&part=snippet,status`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${publisher.accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": String(videoSize),
        "X-Upload-Content-Type": "video/mp4",
      },
      body: JSON.stringify({
        snippet: {
          title: title.slice(0, 100),
          description,
          tags: options.tags ?? [],
          categoryId: options.categoryId ?? "22",
          defaultLanguage: "en",
        },
        status: {
          privacyStatus: options.privacyStatus ?? "public",
          selfDeclaredMadeForKids: false,
        },
      }),
    },
  );

  if (!initRes.ok) {
    const err = await initRes.text();
    throw new Error(`YouTube init failed: ${err}`);
  }

  const uploadUrl = initRes.headers.get("Location");
  if (!uploadUrl) throw new Error("YouTube: no upload URL in response");

  // Step 2: Upload video
  const fileBuffer = fs.readFileSync(videoPath);
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(videoSize),
    },
    body: fileBuffer,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`YouTube upload failed: ${err}`);
  }

  const data = await uploadRes.json();
  const videoId = data.id;

  return {
    videoId,
    url: `https://www.youtube.com/shorts/${videoId}`,
  };
}

export function buildYouTubeTags(niche: string): string[] {
  const nicheTags: Record<string, string[]> = {
    stoic: ["stoicism", "stoic", "philosophy", "mindset", "motivation", "Marcus Aurelius"],
    ai: ["AI", "artificial intelligence", "ChatGPT", "future", "technology", "automation"],
    productivity: ["productivity", "habits", "focus", "self improvement", "time management"],
    psychology: ["psychology", "dark psychology", "mindset", "influence", "behavior"],
    money: ["investing", "wealth", "financial freedom", "money", "finance", "passive income"],
    "gut health": ["gut health", "SIBO", "microbiome", "IBS", "digestive health", "wellness"],
  };
  return nicheTags[niche.toLowerCase()] ?? ["shorts", "viral", "trending"];
}
