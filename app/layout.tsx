import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GhostFeed — It runs your channel while you sleep",
  description:
    "Autonomous AI agent that researches trends, writes scripts, generates visuals, composes voiceover, and publishes short-form video.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
