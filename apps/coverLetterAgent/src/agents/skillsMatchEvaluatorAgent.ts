import OpenAI from "openai";

type MatchBreakdownLLM = {
  education: number;
  experience: number;
  skills: number;
  projects: number;
  location: number;
};

export type MatchBreakdown = {
  education: number;
  experience: number;
  skills: number;
  projects: number;
  location: number;
  overall: number;
};

function clampScore(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function extractJsonObject(text: string): unknown {
  // Fast path
  try {
    return JSON.parse(text);
  } catch {
    // Fallback: extract first {...} block
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const candidate = text.slice(start, end + 1);
      return JSON.parse(candidate);
    }
    throw new Error(`LLM did not return JSON: ${text}`);
  }
}

export default async function skillsMatchEvaluatorAgent(
  clientOpenAI: OpenAI,
  conversationId: string,
): Promise<MatchBreakdown> {
  const prompt = `
  You are a professional career counselor.
  Use ONLY the conversation items labeled USER_DATA and JOB_DATA.

  Task:
  Score how well the applicant matches the job in each category (0-100):
  - skills: overlap between user's listed skills/projects tech and job requirements
  - experience: relevance of prior roles + responsibilities to the job
  - education: degree/major/courses alignment to requirements (if none required, education should be 100)
  - projects: relevance of projects to the job domain/stack
  - location: match to job locations/remote/hybrid constraints (if remote, location should be 100)

  STRICT OUTPUT STRUCTURE:
  Return ONLY a single JSON object with EXACTLY these keys and integer values 0-100:

  {
    "education": number,
    "experience": number,
    "skills": number,
    "projects": number,
    "location": number
  }

  No commentary. No markdown. No extra keys.
  `.trim();

  await clientOpenAI.conversations.items.create(conversationId, {
    items: [
      {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: prompt }],
      },
    ],
  });

  const response = await clientOpenAI.responses.create({
    model: "gpt-5.1",
    conversation: conversationId,
    input: "Return the JSON score object now.",
    temperature: 0,
  });

  const raw = response.output_text?.trim();
  if (!raw) {
    throw new Error("No response from LLM during skill matching evaluation");
  }

  const parsed = extractJsonObject(raw) as Partial<MatchBreakdownLLM>;

  const education = clampScore(parsed.education);
  const experience = clampScore(parsed.experience);
  const skills = clampScore(parsed.skills);
  const projects = clampScore(parsed.projects);
  const location = clampScore(parsed.location);

  const overall = clampScore(
    0.3 * skills +
      0.3 * experience +
      0.2 * projects +
      0.1 * education +
      0.1 * location,
  );

  return {
    education,
    experience,
    skills,
    projects,
    location,
    overall,
  };
}
