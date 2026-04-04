# GhostFeed

**Autonomous AI agent that runs your faceless content channel end-to-end.**

One command → trending topic research → script → images → voiceover → captions → MP4.

```
Brain (LLM) ──► Script ──► Images (Flux) ──► Voice (edge-tts) ──► Captions ──► FFmpeg ──► MP4
```

## Quick Start

```bash
cp .env.example .env   # add NEBIUS_API_KEY
npm install
npx tsx src/index.ts run --niche stoic
```

## Commands

| Command | Description |
|---|---|
| `run --niche <name>` | Generate one video |
| `run --custom-niche "topic"` | Custom niche |
| `loop --niche <name> -i <min>` | Autonomous loop |
| `demo` | Generate across all niches |

**Niches:** stoic · ai · productivity · psychology · money · gut-health

## Web App (SaaS)

```bash
npm run dev    # Next.js app on localhost:3000
```

### Stack
- **Frontend:** Next.js 14, React, Tailwind
- **Auth & DB:** Supabase
- **Payments:** Stripe ($49 / $99 / $299/mo)
- **Video pipeline:** Nebius (Qwen3 + Flux Schnell) + edge-tts + FFmpeg

### API Routes
- `POST /api/stripe/checkout` — create Stripe Checkout session
- `POST /api/stripe/webhook` — handle Stripe events
- `POST /api/waitlist` — join waitlist
- `POST /api/generate-script` — generate video script
- `POST /api/produce-video` — run full pipeline

## Deploy

```bash
vercel deploy --prod
```

Set env vars in Vercel dashboard (see `.env.example`).

## Pricing
- **Starter** $49/mo — 30 videos, 3 niches
- **Pro** $99/mo — unlimited, all niches, auto-post
- **Agency** $299/mo — 10 channels, white-label

## Status
- [x] Full video pipeline
- [x] Dashboard UI
- [x] Landing page + pricing + waitlist
- [x] Stripe checkout + webhook
- [x] Supabase schema + RLS
- [ ] Stripe price IDs (needs account setup)
- [ ] Auto-post to TikTok/YouTube Shorts
- [ ] Vercel deploy (ready, needs env vars)
