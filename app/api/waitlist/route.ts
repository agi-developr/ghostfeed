import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("waitlist")
    .upsert({ email, created_at: new Date().toISOString() });

  if (error && !error.message.includes("duplicate")) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
