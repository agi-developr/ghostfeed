import Link from "next/link";

const styles = {
  body: {
    fontFamily: '"Times New Roman", Times, serif',
    background: "#fff",
    color: "#000",
    minHeight: "100vh",
    lineHeight: 1.6,
    margin: 0,
    padding: 0,
  },
  hero: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "80px 20px 60px",
    textAlign: "center" as const,
  },
  h1: {
    fontSize: "4.5em",
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: -2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: "1.5em",
    fontStyle: "italic",
    color: "#555",
    marginBottom: 40,
  },
  desc: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 15,
    color: "#666",
    maxWidth: 600,
    margin: "0 auto 40px",
    lineHeight: 1.7,
  },
  ctaButtons: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  btn: {
    display: "inline-block",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 14,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: 1.5,
    padding: "14px 32px",
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
  },
  btnPrimary: {
    background: "#000",
    color: "#fff",
  },
  btnSecondary: {
    background: "#fff",
    color: "#000",
    border: "2px solid #000",
  },
  section: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "60px 20px",
    borderTop: "2px solid #000",
  },
  sectionTitle: {
    fontSize: "2em",
    fontWeight: 700,
    textAlign: "center" as const,
    marginBottom: 40,
  },
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 40,
  },
  step: {
    textAlign: "center" as const,
  },
  stepNum: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#000",
    color: "#fff",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: "1.2em",
    marginBottom: 8,
  },
  stepDesc: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 13,
    color: "#666",
    lineHeight: 1.6,
  },
  statsBar: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 20px",
    borderTop: "2px solid #000",
    display: "flex",
    justifyContent: "center",
    gap: 60,
    flexWrap: "wrap" as const,
  },
  statBlock: {
    textAlign: "center" as const,
  },
  statVal: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 42,
    fontWeight: 700,
    lineHeight: 1,
  },
  statLabel: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 11,
    textTransform: "uppercase" as const,
    letterSpacing: 1.5,
    color: "#888",
    marginTop: 4,
  },
  terminal: {
    background: "#000",
    color: "#fff",
    fontFamily: '"SF Mono", Monaco, Menlo, Consolas, monospace',
    padding: "20px 24px",
    fontSize: 12,
    lineHeight: 1.8,
    maxWidth: 700,
    margin: "0 auto",
  },
  footer: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 20,
    borderTop: "1px solid #ddd",
    textAlign: "center" as const,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 12,
    color: "#999",
  },
} as const;

const STEPS = [
  {
    num: 1,
    title: "Pick a Niche",
    desc: "Choose from stoicism, AI, psychology, productivity, or money — or define your own. The agent adapts tone, aesthetics, and topics to match.",
  },
  {
    num: 2,
    title: "Agents Collaborate",
    desc: "Five specialized AI agents work in sequence: Trend Scout finds topics, Scriptwriter crafts the hook+script, Visual Director designs each frame, Voice Forge generates narration, and Editor assembles the final video.",
  },
  {
    num: 3,
    title: "Video Ships",
    desc: "A complete short-form video with burned-in captions, voiceover, and transitions — ready to post. The agent loops autonomously, building a content library while you sleep.",
  },
];

const STATS = [
  { val: "5", label: "Niche Presets" },
  { val: "5", label: "AI Agents" },
  { val: "0", label: "Humans Required" },
];

const TERMINAL_LINES = [
  {
    ts: "00:00",
    agent: "trend-scout",
    text: "Scanning niche: stoic philosophy...",
  },
  {
    ts: "00:03",
    agent: "trend-scout",
    text: 'Found trending angle: "Marcus Aurelius on modern anxiety"',
    ok: true,
  },
  {
    ts: "00:05",
    agent: "scriptwriter",
    text: "Crafting 5-segment hook-first script...",
  },
  {
    ts: "00:12",
    agent: "visual-director",
    text: "Generating 5 scene images (1024x1792)...",
  },
  {
    ts: "00:45",
    agent: "voice-forge",
    text: "Synthesizing voiceover with ElevenLabs TTS...",
  },
  {
    ts: "00:52",
    agent: "editor",
    text: "Assembling video: images + audio + captions...",
  },
  {
    ts: "00:58",
    agent: "editor",
    text: "Complete. output/run_17736/ghostfeed_17736.mp4",
    ok: true,
  },
];

export default function LandingPage() {
  return (
    <div style={styles.body}>
      <div style={styles.hero}>
        <h1 style={styles.h1}>GhostFeed</h1>
        <div style={styles.subtitle}>It runs your channel while you sleep.</div>
        <div style={styles.desc}>
          An autonomous AI agent that researches trending topics, writes
          scripts, generates visuals, composes voiceover, and publishes
          short-form video — all without human intervention.
        </div>
        <div style={styles.ctaButtons}>
          <Link href="/studio" style={{ ...styles.btn, ...styles.btnPrimary }}>
            Try It Live
          </Link>
          <Link
            href="/dashboard"
            style={{ ...styles.btn, ...styles.btnSecondary }}
          >
            View Dashboard
          </Link>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>How It Works</div>
        <div style={styles.steps}>
          {STEPS.map((step) => (
            <div key={step.num} style={styles.step}>
              <div style={styles.stepNum}>{step.num}</div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.statsBar}>
        {STATS.map((stat) => (
          <div key={stat.label} style={styles.statBlock}>
            <div style={styles.statVal}>{stat.val}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2 style={{ ...styles.sectionTitle, marginBottom: 24 }}>
          Agent Activity
        </h2>
        <div style={styles.terminal}>
          {TERMINAL_LINES.map((line, i) => (
            <div key={i}>
              <span style={{ color: "#666" }}>[{line.ts}]</span>{" "}
              <span style={{ color: "#f97316" }}>{line.agent}</span>{" "}
              {line.ok ? (
                <span style={{ color: "#22c55e" }}>{line.text}</span>
              ) : (
                line.text
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.footer}>
        GhostFeed — Fully autonomous AI content pipeline.
      </div>
    </div>
  );
}
