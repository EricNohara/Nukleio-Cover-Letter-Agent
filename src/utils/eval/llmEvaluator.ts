import OpenAI from "openai";
import { IUserInfo } from "../../interfaces/IUserInfoResponse";
import { ITheirStackJob } from "../../interfaces/ITheirStackResponse";
import { ILlmEvaluationResult } from "../../interfaces/IEvaluator";

export default async function llmEvaluator(
  clientOpenAI: OpenAI,
  draft: string,
  userData: IUserInfo,
  jobData: ITheirStackJob
): Promise<ILlmEvaluationResult> {
  const prompt = `You are a hiring manager and technical writing reviewer.

Evaluate this cover letter DRAFT for:
- clarity, impact, readability
- relevance to the job description
- technical alignment with the role
- tone consistency and professionalism

User background:
${JSON.stringify(userData, null, 2)}

Job posting:
${JSON.stringify(jobData, null, 2)}

Draft to evaluate:
"""
${draft}
"""

Return ONLY valid JSON in this EXACT shape:

{
  "score": number,            // 0 to 100 (how strong the letter is)
  "strengths": string[],      // 3 things the draft does well
  "weaknesses": string[],     // 3 things that must be improved
  "recommendations": string[] // 3 specific rewrite instructions
}

Rules:
- Do NOT rewrite the draft.
- Do NOT return anything other than the JSON.
- Do NOT exceed the limit of 3 items for strengths, weaknesses, and recommendations.
- ONLY RETURN THE JSON IN THE EXACT FORMAT SPECIFIED.
- Be honest and strict. This feeds back into an improvement pipeline.`;

  const response = await clientOpenAI.chat.completions.create({
    model: "gpt-5.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2, // Low for consistency but enough variation for improvements
  });

  const raw = response.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error("LLM evaluator returned no output.");

  try {
    return JSON.parse(raw) as ILlmEvaluationResult;
  } catch (err) {
    throw new Error(`Failed to parse LLM evaluator output: ${err}`);
  }
}
