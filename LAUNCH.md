# GhostFeed Launch Plan

## What's built ✅
- Full video pipeline: trends → script → images (Flux) → voice (edge-tts) → captions → MP4
- Dashboard UI with platform connect buttons (TikTok / YouTube OAuth)
- Memory/learning from past videos
- 5 niches: stoic, ai, productivity, psychology, money
- Gut health niche built in
- Loop mode (autonomous, interval-based)
- Stripe checkout + webhook + subscription management
- Waitlist capture API
- TikTok + YouTube auto-publish flow
- Next.js app with all API routes
- **Build passing as of 2026-04-05** ✅

---

## Ilia's 1-hour deploy checklist

### Step 1 — Stripe (~15 min)
1. Go to https://dashboard.stripe.com
2. Create account (or log in)
3. Products → Add product:
   - "GhostFeed Starter" → $49/mo recurring → copy `price_xxx` ID
   - "GhostFeed Creator" → $99/mo recurring → copy `price_xxx` ID
   - "GhostFeed Studio" → $299/mo recurring → copy `price_xxx` ID
4. Developers → API keys → copy `sk_live_xxx` (or `sk_test_xxx` to test first)

### Step 2 — Supabase (~10 min)
1. Go to https://supabase.com → New project
2. Settings → API → copy `Project URL` and `anon key` and `service_role key`
3. SQL Editor → paste and run `supabase/migrations/001_initial.sql`

### Step 3 — Create .env file (~5 min)
```bash
cd ~/Projects/hackathon-ghostfeed
cp .env.example .env
# Edit .env with your keys
```

Minimum keys needed to go live:
```
NEBIUS_API_KEY=...           # Already have this?
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...   # set up after step 4
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_AGENCY=price_...
NEXT_PUBLIC_BASE_URL=https://ghostfeed.vercel.app   # update after deploy
```

### Step 4 — Vercel deploy (~10 min)
```bash
vercel login   # one-time, opens browser
vercel --prod  # deploys from current dir
```
- Add all .env vars in Vercel dashboard → Project → Settings → Environment Variables
- Or use: `vercel env add STRIPE_SECRET_KEY`

### Step 5 — Stripe webhook (~5 min)
1. Stripe → Developers → Webhooks → Add endpoint
2. URL: `https://your-vercel-url.vercel.app/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_succeeded`
4. Copy `whsec_xxx` → add to Vercel env as `STRIPE_WEBHOOK_SECRET`

### Step 6 — Optional: TikTok + YouTube OAuth (~15 min)
- TikTok: developers.tiktok.com → create app → copy client key + secret
- YouTube: console.cloud.google.com → enable YouTube Data API v3 → OAuth credentials

---

## Post-launch distribution (LAUNCH_CONTENT.md has copy ready)
- [ ] Twitter/X thread with demo video
- [ ] r/SideProject + r/entrepreneur post
- [ ] Product Hunt launch
- [ ] Cold DM to 20 creators in target niches

## Pricing
- **Starter:** $49/mo — 30 videos/mo, 3 niches
- **Creator:** $99/mo — unlimited videos, all niches, auto-post
- **Studio:** $299/mo — white-label, agency use

## Positioning
"The only AI that runs your entire faceless content channel — from trend research to posted video — without you touching it."

## Target customer
Creators who want a faceless TikTok/YouTube Shorts presence but don't want to be on camera or spend hours editing. "Set it and forget it."
