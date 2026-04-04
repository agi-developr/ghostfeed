/**
 * YouTube OAuth2 callback — exchange code for tokens, store in Supabase
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../../../lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const savedState = request.cookies.get("youtube_state")?.value;

  if (error || !code || state !== savedState) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=youtube_${error ?? "invalid"}`,
    );
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/youtube/callback`,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || tokenData.error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=youtube_token_failed`,
    );
  }

  const { access_token, refresh_token, expires_in } = tokenData;

  // Get YouTube channel info to store as platform_user_id
  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true",
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
  const channelData = await channelRes.json();
  const channelId = channelData.items?.[0]?.id ?? "unknown";

  const supabase = createClient();
  await supabase.from("platform_connections").upsert({
    platform: "youtube",
    platform_user_id: channelId,
    access_token,
    refresh_token,
    expires_at: new Date(Date.now() + (expires_in ?? 3600) * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });

  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?connected=youtube`,
  );
  response.cookies.delete("youtube_state");
  return response;
}
