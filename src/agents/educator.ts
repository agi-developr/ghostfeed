import { chatJSON } from "../llm.js";
import type { Script, NicheConfig } from "../types.js";
import { log } from "../ui.js";

export type EducationalStructure =
  | "problem-mechanism-action"
  | "myth-bust"
  | "patient-journey";

export interface KnowledgeContext {
  topic: string;
  facts: string[];
  commonMyths: string[];
  sources: string[];
}

export interface EducationalScript extends Script {
  structure: EducationalStructure;
  keyLearnings: string[];
  sources: string[];
}

const SYSTEM = `You are an expert medical educator who creates short-form educational content.
Your goal is to make complex medical topics CLEAR and MEMORABLE in 30-60 seconds.

You use three storytelling structures:

1. **problem-mechanism-action**: Present a health problem → explain the biological mechanism (WHY it happens) → give actionable steps
2. **myth-bust**: State a common belief → explain why it's wrong with evidence → reveal what actually works
3. **patient-journey**: Describe common symptoms → explain why doctors miss the real cause → reveal the actual diagnosis path

Rules:
- ACCURACY FIRST. Never oversimplify to the point of being wrong.
- Use analogies to explain mechanisms (e.g., "SIBO is like weeds growing in the wrong garden bed")
- Each segment should teach ONE clear concept
- Hook must create curiosity gap ("What your GI doctor won't tell you about bloating")
- End with actionable takeaway, not just "follow for more"
- Cite sources where possible
- Avoid medical advice — frame as "research shows" or "studies suggest"

Return JSON matching the exact schema requested.`;

export async function generateEducationalScript(
  topic: string,
  structure: EducationalStructure,
  knowledge: KnowledgeContext,
  niche: NicheConfig,
): Promise<EducationalScript> {
  log("writer", `Educational script: "${topic}" [${structure}]`);

  const result = await chatJSON<EducationalScript>(
    SYSTEM,
    `Topic: ${topic}
Structure: ${structure}
Niche: ${niche.name}
Tone: ${niche.tone}
Visual aesthetic: ${niche.aesthetic}

Knowledge context (use these facts, they are verified):
${knowledge.facts.map((f) => `- ${f}`).join("\n")}

Common myths to address:
${knowledge.commonMyths.map((m) => `- ${m}`).join("\n")}

Sources:
${knowledge.sources.map((s) => `- ${s}`).join("\n")}

Create a 30-50 second educational video script. Return JSON:
{
  "title": "compelling title for posting",
  "hook": "first 3 seconds — create curiosity gap about this topic",
  "segments": [
    {
      "text": "narration teaching ONE clear concept — use analogy if helpful",
      "visualPrompt": "detailed AI image prompt — ${niche.aesthetic} — show the concept visually",
      "durationSec": 10
    }
  ],
  "cta": "actionable takeaway + follow",
  "totalDurationSec": 45,
  "structure": "${structure}",
  "keyLearnings": ["what the viewer will know after watching — 2-3 bullet points"],
  "sources": ["cited sources from the knowledge context"]
}

IMPORTANT: Visual prompts should explain the medical concept visually — use metaphors, diagrams-as-scenes, anatomical imagery. Make each image DIFFERENT and educational.`,
  );

  log(
    "writer",
    `Educational script ready: "${result.title}" [${result.structure}]`,
  );
  log(
    "writer",
    `Key learnings: ${result.keyLearnings?.join(" | ") || "none specified"}`,
  );
  return result;
}
