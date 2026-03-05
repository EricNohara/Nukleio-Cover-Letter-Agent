import OpenAI from "openai";

function buildPrompt(feedback: string) {
  return `You are naming a revised cover letter draft for a UI.

    Goal: create a short, semantic label describing the main revision(s) implied by the feedback.

    Rules:
    - Output ONLY the name (no quotes, no punctuation, no extra text).
    - 3 to 8 words.
    - Be specific about *what changed* (skills added, tone adjusted, structure changed, examples added, etc.).
    - Prefer action + target (e.g., "Add python skills examples", "Tighten opening paragraph").

    Feedback JSON:
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
  conversationId: string,
  feedback: string,
) {
  const prompt = buildPrompt(feedback);

  // generate the draft
  await clientOpenAI.conversations.items.create(conversationId, {
    items: [
      {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: prompt }],
      },
    ],
  });

  // 2. Ask the model to produce the letter using stored context
  const response = await clientOpenAI.responses.create({
    model: "gpt-5.1",
    conversation: conversationId,
    input: "Generate the 3 - 8 word draft name now.",
    temperature: 0.2,
  });

  const name = response.output_text?.trim();
  if (!name) {
    throw new Error("No response from LLM during cover letter draft naming");
  }

  return validateDraftName(name);
}
