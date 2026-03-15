import OpenAI from "openai";
import { config } from "./config.js";

export const nebius = new OpenAI({
  apiKey: config.nebius.apiKey,
  baseURL: config.nebius.baseUrl,
});

export async function chat(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const res = await nebius.chat.completions.create({
    model: config.nebius.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });
  const raw = res.choices[0]?.message?.content ?? "";
  // Strip <think> blocks that Qwen sometimes produces
  return raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

export async function chatJSON<T>(
  systemPrompt: string,
  userPrompt: string,
): Promise<T> {
  const res = await nebius.chat.completions.create({
    model: config.nebius.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });
  const raw = res.choices[0]?.message?.content ?? "{}";
  // Strip <think> blocks before parsing
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  return JSON.parse(cleaned) as T;
}
