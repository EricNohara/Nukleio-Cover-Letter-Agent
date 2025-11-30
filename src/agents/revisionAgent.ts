import OpenAI from "openai";
import { IDraftEvaluationResult } from "../interfaces/IEvaluator";
import { WritingAnalysis } from "../utils/writing/writingSchema";

function buildPrompt(
  feedback: IDraftEvaluationResult,
  writingAnalysis: WritingAnalysis | null
) {
  return `You are a cover letter revisor.
    Revise the LATEST_DRAFT by implementing the inputted feedback.
    
    Use ONLY:
    - USER_DATA 
    - JOB_DATA 
    ${writingAnalysis ? "- WRITING_ANALYSIS" : ""}
    - LATEST_DRAFT (the NEWEST one only)

    Your task:
    Revise the LATEST_DRAFT to fix all issues described in FEEDBACK.

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
    - OUTPUT FORMAT: ONLY plain text cover letter, NOTHING else.
    - WORD COUNT: 250 - 400 words.
    - PARAGRAPH COUNT: 3 - 5 paragraphs.

    FEEDBACK JSON:
    ${JSON.stringify(feedback)}
    
    Revise the draft, outputting ONLY the plain text of the new cover letter following the above instructions.`.trim();
}

export default async function revisionAgent(
  clientOpenAI: OpenAI,
  conversationId: string,
  feedback: IDraftEvaluationResult,
  writingAnalysis: WritingAnalysis | null
) {
  const prompt = buildPrompt(feedback, writingAnalysis);

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
    input: "Generate the revised 250 - 400 word cover letter now.",
    temperature: 0.85,
  });

  const revisedDraft = response.output_text?.trim();
  if (!revisedDraft) {
    throw new Error("No response from LLM during cover letter revision");
  }

  return revisedDraft;
}
