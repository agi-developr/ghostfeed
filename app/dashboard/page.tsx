"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const s = {
  page: { fontFamily: "Arial, Helvetica, sans-serif", maxWidth: 900, margin: "0 auto", padding: "40px 20px" },
  heading: { fontFamily: "'Times New Roman', serif", fontSize: "2em", fontWeight: 700, marginBottom: 8 },
  sub: { color: "#666", fontSize: 14, marginBottom: 40 },
  section: { marginBottom: 40 },
  sectionTitle: { fontSize: 13, textTransform: "uppercase" as const, letterSpacing: 1.5, color: "#888", marginBottom: 16, fontWeight: 600 },
  card: { border: "2px solid #e5e7eb", padding: "20px 24px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  platformName: { fontWeight: 700, fontSize: 15 },
  platformDesc: { fontSize: 13, color: "#666", marginTop: 2 },
  btn: { padding: "10px 20px", fontSize: 13, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 1, cursor: "pointer", border: "2px solid #000", background: "#000", color: "#fff", textDecoration: "none", display: "inline-block" },
  btnOutline: { padding: "10px 20px", fontSize: 13, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 1, cursor: "pointer", border: "2px solid #000", background: "#fff", color: "#000", textDecoration: "none", display: "inline-block" },
  btnSuccess: { padding: "10px 20px", fontSize: 13, fontWeight: 600, letterSpacing: 1, border: "2px solid #16a34a", background: "#f0fdf4", color: "#16a34a", display: "inline-block" },
  toast: { background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 20px", marginBottom: 24, fontSize: 13, color: "#166534" },
  stat: { display: "inline-block", textAlign: "center" as const, marginRight: 40 },
  statVal: { fontSize: "2em", fontWeight: 700, lineHeight: 1 },
  statLbl: { fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 1.5, color: "#888", marginTop: 4 },
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected");
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  const [videoCount, setVideoCount] = useState<number>(0);

  useEffect(() => {
    fetch("/output/memory.json")
      .then((r) => r.json())
      .then((d) => setVideoCount(d.videos?.length ?? 0))
      .catch(() => {});
  }, []);

  return (
    <div style={s.page}>
      <script src="/nav.js" async />

      <h1 style={s.heading}>Dashboard</h1>
      <p style={s.sub}>Manage your autonomous content channels</p>

      {connected && (
        <div style={s.toast}>
          ✅ {connected === "tiktok" ? "TikTok" : "YouTube"} connected successfully!
        </div>
      )}
      {success && <div style={s.toast}>✅ Subscription activated. Welcome to GhostFeed Pro!</div>}
      {error && (
        <div style={{ ...s.toast, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}>
          ⚠️ {error.replace(/_/g, " ")}
        </div>
      )}

      {/* Stats */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Overview</div>
        <div>
          <div style={s.stat}>
            <div style={s.statVal}>{videoCount}</div>
            <div style={s.statLbl}>Videos Made</div>
          </div>
          <div style={s.stat}>
            <div style={s.statVal}>5</div>
            <div style={s.statLbl}>Niches</div>
          </div>
          <div style={s.stat}>
            <div style={s.statVal}>0</div>
            <div style={s.statLbl}>Posted Today</div>
          </div>
        </div>
      </div>

      {/* Connected Platforms */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Connected Platforms</div>

        <div style={s.card}>
          <div>
            <div style={s.platformName}>TikTok</div>
            <div style={s.platformDesc}>Auto-post videos to your TikTok profile</div>
          </div>
          {connected === "tiktok" ? (
            <span style={s.btnSuccess}>✓ Connected</span>
          ) : (
            <a href="/api/auth/tiktok" style={s.btn}>Connect TikTok</a>
          )}
        </div>

        <div style={s.card}>
          <div>
            <div style={s.platformName}>YouTube Shorts</div>
            <div style={s.platformDesc}>Auto-post as YouTube Shorts to your channel</div>
          </div>
          {connected === "youtube" ? (
            <span style={s.btnSuccess}>✓ Connected</span>
          ) : (
            <a href="/api/auth/youtube" style={s.btn}>Connect YouTube</a>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Generate Video</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {["stoic", "ai", "productivity", "psychology", "money"].map((niche) => (
            <a key={niche} href={`/spawn.html?niche=${niche}`} style={s.btnOutline}>
              {niche}
            </a>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <a href="/" style={{ fontSize: 13, color: "#666" }}>← Back to home</a>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
