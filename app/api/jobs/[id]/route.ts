import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory job store (shared with produce-video via module scope)
// For Phase 1, we track jobs from the existing serve.ts pattern
// Phase 2+ will use Supabase for persistent job tracking

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Placeholder — Phase 2 will query Supabase `videos` table
  return NextResponse.json(
    { error: `Job ${id} not found — job tracking migrates in Phase 2` },
    { status: 404 },
  );
}
