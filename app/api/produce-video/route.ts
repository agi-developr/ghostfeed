import { NextResponse } from "next/server";
import { ProduceVideoInput } from "../../../lib/schemas";

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = ProduceVideoInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { script, niche, config } = parsed.data;
  const nicheConfig = {
    name: niche || "custom",
    keywords: [],
    tone: "",
    aesthetic: "",
    avoidTopics: [],
  };

  try {
    const { generateFromScript } = await import("../../../src/studio");
    const videoPath = await generateFromScript(script, nicheConfig, config);
    return NextResponse.json({ videoPath, status: "complete" });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Video production failed", message: err.message },
      { status: 500 },
    );
  }
}
