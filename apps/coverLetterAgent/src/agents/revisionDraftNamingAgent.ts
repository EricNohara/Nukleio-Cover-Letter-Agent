import OpenAI from "openai";

function buildPrompt(feedback: string) {
  return `
    Return a short, semantic label describing the main revision implied by FEEDBACK.

    Rules:
    - Output ONLY the name as plain text (no quotes, no punctuation)
    - 3 to 8 words
    - Be specific about what changed in the returned draft name

    FEEDBACK:
    ${JSON.stringify(feedback)}
    `.trim();
}

function validateDraftName(name: string): string {
  // remove quotes and punctuation
  let cleaned = name
    .replace(/["'`]/g, "") // remove quotes
    .replace(/[^\w\s]/g, "") // remove punctuation
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();

  return cleaned;
}

export default async function revisionDraftNamingAgent(
  clientOpenAI: OpenAI,
  feedback: string,
) {
  const prompt = buildPrompt(feedback);

  const response = await clientOpenAI.responses.create({
    model: "gpt-5.4-nano",
    input: prompt,
    temperature: 0.2,
  });

  const name = response.output_text?.trim();
  if (!name) {
    throw new Error("No response from LLM during cover letter draft naming");
  }

  return validateDraftName(name);
}
