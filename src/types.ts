export interface Trend {
  topic: string;
  angle: string;
  whyNow: string;
  viralScore: number; // 1-10
}

export interface Script {
  title: string;
  hook: string;
  segments: ScriptSegment[];
  cta: string;
  totalDurationSec: number;
}

export interface ScriptSegment {
  text: string;
  visualPrompt: string;
  durationSec: number;
}

export interface VideoAssets {
  images: string[]; // file paths
  voiceover: string; // file path to mp3
  captions: string; // file path to ass/srt
}

export interface ContentMemory {
  videos: VideoRecord[];
}

export interface RunConfig {
  voice?: string;
  imageModel?: string;
  structure?: string;
  tone?: string;
  aesthetic?: string;
  segments?: number;
  durationSec?: number;
  captionFontSize?: number;
  fadeDuration?: number;
  crf?: number;
}

export interface VideoRecord {
  id: string;
  timestamp: string;
  niche: string;
  topic: string;
  angle: string;
  script: Script;
  outputPath: string;
  config?: RunConfig;
  mockEngagement: {
    views: number;
    likes: number;
    retention: number;
  };
}

export interface NicheConfig {
  name: string;
  keywords: string[];
  tone: string;
  aesthetic: string;
  avoidTopics: string[];
}
