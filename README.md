# GhostFeed

Autonomous AI agent that runs faceless content channels end-to-end. One command generates script, images, voiceover, captions, and assembles a TikTok-ready vertical video.

```
Brain (LLM) ──► Script ──► Images (Flux) ──► Voice (edge-tts) ──► Captions (ASS) ──► FFmpeg ──► MP4
                  │                                                                              │
                  └──────────────────── memory.json ◄────────────────────────────────────────────┘
```

## Quick Start

```bash
cp .env.example .env     # add NEBIUS_API_KEY
npm install
npx tsx src/index.ts run --niche stoic
```

## Commands

| Command                        | Description                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| `run --niche <name>`           | Generate one video (stoic, ai, productivity, psychology, money) |
| `run --custom-niche "topic"`   | Generate with a custom niche                                    |
| `loop --niche <name> -i <min>` | Autonomous loop (default 5 min interval)                        |
| `demo`                         | Generate across multiple niches                                 |
| `educate -t <index\|all>`      | Educational content (gut health)                                |

## Dashboard

```bash
npx tsx serve.ts
# open http://localhost:3333
```

## Stack

- **LLM:** Qwen3-235B via Nebius API (OpenAI-compatible)
- **Images:** Flux Schnell (Nebius)
- **Voice:** edge-tts (free, no API key)
- **Captions:** ASS subtitles burned into video
- **Assembly:** FFmpeg with Ken Burns motion + crossfades
- **Dashboard:** Single-file HTML, auto-refreshes from memory.json
