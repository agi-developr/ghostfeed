/**
 * TikTok OAuth2 - initiate authorization
 * Redirect user to TikTok login page
 */
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    scope: "video.publish,video.upload",
    response_type: "code",
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/tiktok/callback`,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const response = NextResponse.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params}`,
  );

  // Store verifier in cookie for callback
  response.cookies.set("tiktok_state", state, { httpOnly: true, maxAge: 600 });
  response.cookies.set("tiktok_verifier", codeVerifier, { httpOnly: true, maxAge: 600 });

  return response;
}
