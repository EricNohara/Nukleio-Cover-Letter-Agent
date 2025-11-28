import OpenAI from "openai";
import { IDraftEvaluationResult } from "../interfaces/IEvaluator";

function buildPrompt(draft: string, feedback: IDraftEvaluationResult) {
  return `You are an expert cover letter revisor.
    You have recieved feedback for your first draft and need to make some changes.
    
    Use ONLY the conversation's stored data:
    - USER DATA
    - JOB DATA
    - WRITING ANALYSIS

    Your task:
    Revise the DRAFT to fix all issues described in FEEDBACK while preserving the positive feedback given and the user's information.

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

    DRAFT:
    <<<
    ${draft}
    >>>

    FEEDBACK JSON:
    ${JSON.stringify(feedback)}
    
    Revise the draft, outputting ONLY the plain text of the new cover letter following the above instructions.`.trim();
}

export default async function revisionAgent(
  clientOpenAI: OpenAI,
  conversationId: string,
  draft: string,
  feedback: IDraftEvaluationResult
) {
  const prompt = buildPrompt(draft, feedback);

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
