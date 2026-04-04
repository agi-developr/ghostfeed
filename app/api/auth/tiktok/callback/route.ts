/**
 * TikTok OAuth2 callback — exchange code for access token, store in Supabase
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../../../lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const savedState = request.cookies.get("tiktok_state")?.value;
  const codeVerifier = request.cookies.get("tiktok_verifier")?.value;

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=tiktok_denied`,
    );
  }

  if (!code || state !== savedState || !codeVerifier) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=tiktok_invalid_state`,
    );
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/tiktok/callback`,
      code_verifier: codeVerifier,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || tokenData.error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?error=tiktok_token_failed`,
    );
  }

  // Store tokens in Supabase (linked to user via session cookie)
  const supabase = createClient();
  // Note: in production, get user_id from session cookie / Supabase auth
  // For now store as platform_connections table
  const { access_token, refresh_token, expires_in, open_id } = tokenData;

  await supabase.from("platform_connections").upsert({
    platform: "tiktok",
    platform_user_id: open_id,
    access_token,
    refresh_token,
    expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });

  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?connected=tiktok`,
  );
  response.cookies.delete("tiktok_state");
  response.cookies.delete("tiktok_verifier");
  return response;
}
