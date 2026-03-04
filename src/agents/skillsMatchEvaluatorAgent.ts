import OpenAI from "openai";

export default async function skillsMatchEvaluatorAgent(
  clientOpenAI: OpenAI,
  conversationId: string,
) {
  const prompt = `
  You are a professional career counselor.
  Evaluate how well the applicant matches the requirements for the job posting on a 0 - 100 scale.

  Use ONLY:
  - USER_DATA 
  - JOB_DATA 

  Return a score 0 - 100 where:
  - 0 means the USER_DATA does not match the JOB_DATA at all.
  - 100 means the USER_DATA exactly matches the JOB_DATA.

  STRICT OUTPUT STRUCTURE:
  Return ONLY a single integer between 0 and 100.
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
    input: "Score the applicant now.",
    temperature: 0.1,
  });

  const raw = response.output_text?.trim();
  if (!raw) {
    throw new Error("No response from LLM during skill matching evaluation");
  }

  const match = raw.match(/\d+/);
  if (!match) {
    throw new Error(`Invalid score returned: ${raw}`);
  }

  const score = Math.max(0, Math.min(100, parseInt(match[0], 10)));

  return score;
}
