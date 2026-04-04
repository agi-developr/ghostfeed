#!/bin/bash
# Run this with a screen recorder going to capture the demo video
# Generates one stoic video with verbose output

echo "🎬 Starting GhostFeed demo recording..."
echo "Press Ctrl+C to stop after video is generated"
echo ""

cd "$(dirname "$0")"

# Run one cycle with the stoic niche
npx tsx src/index.ts run --niche stoic

echo ""
echo "✅ Done! Check output/ for the generated video."
echo "Open it with: open output/$(ls -t output/ | head -1)/ghostfeed_*.mp4"
