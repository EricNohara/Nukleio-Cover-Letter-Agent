import OpenAI from "openai";
import { WritingAnalysis } from "../utils/writing/writingSchema";

function generatePromptWithWritingAnalysis() {
  return `You are a cover letter writer.

Write a polished 250 - 400 word cover letter using:
- the USER DATA previously stored in the conversation
- the JOB DATA previously stored in the conversation
- the WRITING ANALYSIS previously stored in the conversation

Follow this strict structure:
1. Applicant name + contact info + date
2. Personalized greeting with hiring manager name if known
3. Strong intro paragraph
4. 1 - 2 technical body paragraphs linking user's skills to job requirements
5. Professional closing paragraph
6. "Sincerely," + 2 - 4 blank lines + applicant's full name

Requirements:
- Use the user's real experiences only
- Map technical skills directly to job requirements
- Slight imperfections allowed
- Vary sentence length
- Avoid cliches / buzzwords
- No course names (describe concepts instead)
- Output ONLY the plain text letter, NOTHING else.
  `.trim();
}

function generatePromptWithoutWritingAnalysis() {
  return `You are a cover letter writer.

Write a polished 250 - 400 word cover letter using:
- the USER DATA previously stored in the conversation
- the JOB DATA previously stored in the conversation

Follow this strict structure:
1. Applicant name + contact info + date
2. Personalized greeting with hiring manager name if known
3. Strong intro paragraph
4. 1 - 2 technical body paragraphs linking user's skills to job requirements
5. Professional closing paragraph
6. "Sincerely," + 2 - 4 blank lines + applicant's full name

Requirements:
- Use the user's real experiences only
- Map technical skills directly to job requirements
- Slight imperfections allowed
- Vary sentence length
- Avoid cliches / buzzwords
- No course names (describe concepts instead)
- Output ONLY the plain text letter, NOTHING else.
  `.trim();
}

export default async function firstDraftAgent(
  clientOpenAI: OpenAI,
  conversationId: string,
  writingAnalysis: WritingAnalysis | null
) {
  const prompt = writingAnalysis
    ? generatePromptWithWritingAnalysis()
    : generatePromptWithoutWritingAnalysis();

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
