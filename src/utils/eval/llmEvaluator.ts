import OpenAI from "openai";
import { ILlmEvaluationResult } from "../../interfaces/IEvaluator";

export default async function llmEvaluator(
  clientOpenAI: OpenAI,
  conversationId: string,
  draft: string
): Promise<ILlmEvaluationResult> {
  const prompt = `You are a hiring manager and technical writing reviewer.

Evaluate this cover letter DRAFT for:
- clarity, impact, readability
- relevance to the job description
- technical alignment with the role
- tone consistency and professionalism

Use the following in your evaluation:
- the USER DATA previously stored in the conversation
- the JOB DATA previously stored in the conversation
- the WRITING ANALYSIS previously stored in the conversation

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
