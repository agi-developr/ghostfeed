import OpenAI from "openai";
import { config } from "./config.js";

export const nebius = new OpenAI({
  apiKey: config.nebius.apiKey,
  baseURL: config.nebius.baseUrl,
});

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt === maxRetries) throw err;
      const delay = Math.min(1000 * 2 ** attempt, 10000);
      console.warn(
        `[retry] Attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}

export async function chat(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  return withRetry(async () => {
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
    return raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  });
}

export async function chatJSON<T>(
  systemPrompt: string,
  userPrompt: string,
): Promise<T> {
  return withRetry(async () => {
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
    const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    return JSON.parse(cleaned) as T;
  });
}

export { withRetry };
