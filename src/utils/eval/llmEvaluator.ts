import OpenAI from "openai";
import { ILlmEvaluationResult } from "../../interfaces/IEvaluator";
import { WritingAnalysis } from "../writing/writingSchema";

export default async function llmEvaluator(
  clientOpenAI: OpenAI,
  conversationId: string,
  writingAnalysis: WritingAnalysis | null
): Promise<ILlmEvaluationResult> {
  const prompt = `You are a hiring manager reviewing a cover letter.

Evaluate the MOST RECENT draft in this conversation. 
It will be stored as a message beginning with **"LATEST_DRAFT:"**.

Use ONLY:
- USER_DATA 
- JOB_DATA 
${writingAnalysis && "- WRITING_ANALYSIS"}
- LATEST_DRAFT (the NEWEST one only)

Your evaluation must address:
- clarity, impact, readability, professionalism
- relevance to the job description
- technical alignment with the role

Return ONLY valid JSON in this EXACT shape:

{
  "score": number,            // 0 to 100 (how strong the letter is)
  "strengths": string[],      // 3 things the draft does well
  "weaknesses": string[],     // 3 things to be improved
  "recommendations": string[] // 3 specific rewrite instructions
}

Rules:
- Do NOT rewrite the draft.
- Do NOT output anything other than the JSON.
- EXACTLY 3 strengths, 3 weaknesses, 3 recommendations.
- Be strict and objective.`;

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
    input: "Evaluate the draft now and output the JSON ONLY.",
    temperature: 0.2,
  });

  const raw = response.output_text?.trim();
  if (!raw) throw new Error("LLM evaluator returned no output.");

  try {
    return JSON.parse(raw) as ILlmEvaluationResult;
  } catch (err) {
    throw new Error(`Failed to parse LLM evaluator output: ${err}`);
  }
}
