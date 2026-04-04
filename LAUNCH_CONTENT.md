# GhostFeed Launch Content

## Twitter/X Launch Thread

---

**Tweet 1 (hook):**
I built an AI that runs a faceless TikTok channel end-to-end.

Zero human input. One command.

Here's what it does in 60 seconds 👇

---

**Tweet 2 (the pipeline):**
GhostFeed pipeline:

1. Scans trending topics in your niche
2. Writes a hook-first script
3. Generates visuals with Flux AI
4. Records voiceover
5. Burns in captions
6. Assembles the MP4
7. Posts to TikTok + YouTube Shorts

Automatically. On a loop.

---

**Tweet 3 (the why):**
Faceless content channels make $3k-30k/month.

The bottleneck isn't ideas. It's production.

Script → shoot → edit → caption → post → repeat.

GhostFeed removes every step after "pick a niche."

---

**Tweet 4 (niches):**
Built-in niches that actually work:

• Stoic philosophy
• AI & future tech
• Dark psychology
• Productivity
• Wealth building

Or define your own with a single flag.

---

**Tweet 5 (tech):**
Stack:
- Qwen3-235B (Nebius) for scripts
- Flux Schnell for visuals
- edge-tts for voiceover (free, surprisingly good)
- FFmpeg for assembly
- TikTok v2 API + YouTube Data API for posting

Cost per video: ~$0.08

---

**Tweet 6 (demo):**
[attach screen recording of terminal running a cycle]

Full cycle: 58 seconds
Cost: $0.08
Human input: 0

---

**Tweet 7 (CTA):**
Early access is open.

First 100 get 3 months free on Pro.

ghostfeed.app ↗

---

## Product Hunt

**Tagline:**
Autonomous AI agent that runs your faceless content channel end-to-end

**Description:**
GhostFeed is an AI agent that handles everything a faceless content creator does — minus the creator.

Pick a niche. It researches trending topics, writes hook-first scripts, generates visuals with Flux AI, records voiceover, burns captions, assembles the video, and posts to TikTok and YouTube Shorts. Automatically. On a loop.

**How it works:**
1. Choose a niche (stoic, AI, psychology, productivity, money — or custom)
2. Run `ghostfeed loop --niche stoic`
3. Videos appear in your queue, post to TikTok/Shorts on schedule

**Why now:**
Faceless content channels on TikTok/YouTube are a proven $3k-30k/month business. The bottleneck has always been production speed. GhostFeed removes it entirely.

**Pricing:**
- Starter: $49/mo (30 videos, 3 niches)
- Pro: $99/mo (unlimited + auto-post)
- Agency: $299/mo (10 channels, white-label)

**First comment (maker post):**
Hey PH! 👋

I'm Ilia, solo founder from SF. Built this in a few weeks after getting frustrated watching faceless content creators talk about their process while the actual production bottleneck was obvious: it's all automatable.

GhostFeed does the full pipeline — trend research → script → visuals → voice → captions → post. Each video costs ~$0.08 to generate.

Happy to answer anything. Would love feedback on the niche selection UX — that's the one thing I'm still iterating on.

---

## Reddit Posts

### r/SideProject

**Title:** I built an AI that runs a faceless TikTok channel autonomously — zero human input after setup

After seeing how many faceless content creators were doing well but spending hours on production, I spent a few weeks building GhostFeed — an AI agent that handles the entire pipeline.

Trend research → script → Flux AI visuals → voiceover → captions → FFmpeg assembly → auto-post to TikTok + YouTube Shorts.

Cost per video: ~$0.08. Time per video: 0 minutes (after initial setup).

Stack: Qwen3-235B, Flux Schnell, edge-tts, FFmpeg, TikTok v2 API, YouTube Data API, Next.js, Supabase, Stripe.

Would love feedback — especially from anyone who runs or has tried faceless content channels.

ghostfeed.app

---

### r/entrepreneur

**Title:** Built an AI content agent that runs faceless TikTok channels end-to-end — $0.08/video

Quick breakdown of what I built and why:

**The problem:** Faceless content is a real business ($3k-30k/month for successful channels). The bottleneck is production time — script, record, edit, caption, post, repeat.

**What GhostFeed does:** Automates every step. Pick a niche, it handles the rest — trends, scripts, visuals (Flux AI), voiceover, captions, assembly, posting.

**Cost:** ~$0.08 per video. Runs on a loop, no babysitting.

Looking for feedback on pricing ($49/$99/$299/mo) and whether this solves a real pain point for anyone here.

ghostfeed.app

---

## Cold DM Template (for faceless content creators on Twitter)

Hey [name] — love the [niche] channel. Quick question: how much time does production take per video? Building a tool that automates the whole pipeline (script → visuals → voice → post) and looking for beta testers. Free Pro for 3 months if you try it. ghostfeed.app

---

## Demo Video Script (screen recording)

0:00 - Terminal: `npx tsx src/index.ts run --niche stoic`
0:03 - trend-scout fires, shows "Found: Marcus Aurelius on modern anxiety"
0:05 - scriptwriter outputs hook + 5 segments
0:12 - visual-director generating images (Flux progress)
0:45 - voice-forge synthesizing narration
0:52 - editor assembling video
0:58 - "Complete. output/run_xxxx/ghostfeed_xxxx.mp4"
1:00 - Open the MP4, play it

Total: ~60 seconds. Zero human input.
