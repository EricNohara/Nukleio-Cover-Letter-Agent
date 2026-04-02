import OpenAI from "openai";
import { WritingAnalysis } from "../utils/writing/writingSchema";

function generatePrompt(writingAnalysis: WritingAnalysis | null) {
  return `You are a cover letter writer.

Write a 250 - 400 word cover letter using:
- USER_DATA
- JOB_DATA
${writingAnalysis ? "- WRITING_ANALYSIS" : ""}
${writingAnalysis ? "- WRITING_SAMPLE" : ""}

STRICT LETTER STRUCTURE:
1. Applicant name + contact info + date
2. Personalized greeting with hiring manager name if known
3. Strong intro paragraph
4. 1 - 2 technical body paragraphs linking user's skills to job requirements
5. Professional closing paragraph
6. "Sincerely," + 2 - 4 blank lines + applicant's full name

HARD REQUIREMENTS:
- Use the user's real experiences only
- Map technical skills directly to job requirements
- Slight imperfections allowed
- Vary sentence length. Keep sentences shorter than 25 words.
- Avoid cliches / buzzwords
${
  writingAnalysis
    ? "- Use the same writing style and tone as the inputted writing sample and the analysis of the sample."
    : ""
}
- OUTPUT FORMAT: ONLY plain text cover letter, NOTHING else.
- WORD COUNT: 250 - 400 words.
- PARAGRAPH COUNT: 3 - 5 paragraphs.
  `.trim();
}

export default async function firstDraftAgent(
  clientOpenAI: OpenAI,
  conversationId: string,
  writingAnalysis: WritingAnalysis | null
) {
  const prompt = generatePrompt(writingAnalysis);

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
    input: "Generate the 250 - 400 word cover letter now.",
    temperature: 0.85,
  });

  const draft = response.output_text?.trim();
  if (!draft) {
    throw new Error("No response from LLM during cover letter generation");
  }

  return draft;
}
