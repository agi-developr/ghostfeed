/**
 * YouTube / Google OAuth2 - initiate authorization
 */
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/youtube/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.upload",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  );
  response.cookies.set("youtube_state", state, { httpOnly: true, maxAge: 600 });
  return response;
}
