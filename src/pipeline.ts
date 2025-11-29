import getUserData from "./utils/nukleio/getUserData";
import writingAnalysisAgent from "./agents/writingAnalysisAgent";
import { WritingAnalysis } from "./utils/writing/writingSchema";
import getOpenAIClient from "./utils/ai/getOpenAIClient";
import { extractJobFromUrl } from "./utils/web/extractJobFromUrl";
import { ITheirStackJob } from "./interfaces/ITheirStackResponse";
import { IUserInfo } from "./interfaces/IUserInfoResponse";
import firstDraftAgent from "./agents/firstDraftAgent";
import { IDraftEvaluationResult } from "./interfaces/IEvaluator";
import draftEvaluatorAgent from "./agents/draftEvaluatorAgent";
import revisionAgent from "./agents/revisionAgent";
import { createConversation, storeLatestDraft } from "./utils/ai/conversation";

// pipeline for agentic workflow
export async function runPipeline({
  userId,
  jobUrl,
  jobTitle,
  companyName,
  writingSample,
}: {
  userId: string;
  jobUrl: string;
  jobTitle: string;
  companyName: string;
  writingSample?: string | undefined;
}) {
  // get OpenAI Client
  const clientOpenAI = getOpenAIClient();

  // retrieve user data
  const userData: IUserInfo | null = await getUserData(userId);

  if (!userData) {
    throw new Error(`User with id ${userId} not found.`);
  }

  // invoke job research agent
  const jobData: ITheirStackJob | null = await extractJobFromUrl(
    jobUrl,
    jobTitle,
    companyName
  );

  if (!jobData) {
    throw new Error(
      "No job data found! Please ensure the job title and company names are correct and that the entered job was posted within the last 120 days."
    );
  }

  // invoke writing analysis agent
  const writingAnalysis: WritingAnalysis | null = writingSample
    ? await writingAnalysisAgent(clientOpenAI, writingSample)
    : null;

  // create a conversation to reuse past inputted data
  const conversationId = await createConversation(
    clientOpenAI,
    userData,
    jobData,
    writingAnalysis
  );

  // invoke cover letter first draft agent
  let currentDraft: string = await firstDraftAgent(
    clientOpenAI,
    conversationId,
    writingAnalysis
  );

  // store the draft in the conversation
  await storeLatestDraft(clientOpenAI, conversationId, currentDraft);

  // evaluation feedback loop
  let iterationCount = 0;
  const maxIterations = 3;
  let lastEvaluation: IDraftEvaluationResult;

  while (true) {
    // invoke draft evaluator agent
    lastEvaluation = await draftEvaluatorAgent(
      clientOpenAI,
      conversationId,
      currentDraft,
      userData,
      jobData,
      writingAnalysis
    );

    // Determine pass/fail
    const objectivePass =
      lastEvaluation.objectiveEvaluation.pass &&
      lastEvaluation.objectiveEvaluation.issues.length === 0;

    const llmPass = lastEvaluation.llmEvaluation.score >= 90;

    const stylePass = lastEvaluation.writingStyleEvaluation
      ? lastEvaluation.writingStyleEvaluation.deviations.every(
          (d) => d.severity !== "high"
        )
      : true;

    const isPassed = objectivePass && llmPass && stylePass;

    if (isPassed) break; // success

    if (iterationCount >= maxIterations) break; // stop looping

    iterationCount++;

    // Produce revised draft
    currentDraft = await revisionAgent(
      clientOpenAI,
      conversationId,
      lastEvaluation,
      writingAnalysis
    );

    // store latest draft in the conversation
    await storeLatestDraft(clientOpenAI, conversationId, currentDraft);
  }

  return { currentDraft, conversationId };
}

export async function runRevisionPipeline({
  conversationId,
  feedback,
}: {
  conversationId: string;
  feedback: string;
}) {
  const clientOpenAI = getOpenAIClient();

  const prompt = `
  You are an expert cover letter revisor.
  You have recieved feedback for your LATEST_DRAFT and need to revise.

  Use ONLY:
  - USER_DATA 
  - JOB_DATA 
  - WRITING_ANALYSIS (if available)
  - LATEST_DRAFT (the NEWEST one only)

  Your task:
  Revise the LATEST_DRAFT to fix all issues described in FEEDBACK while preserving the user's information.

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
  - Vary sentence length. Keep sentences shorter than 25 words.
  - Avoid cliches / buzzwords
  - Output ONLY the plain text letter, NOTHING else.

  FEEDBACK:
  ${feedback}

  Revise the draft, outputting ONLY the plain text of the new cover letter following the above instructions.
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
    input: "Generate the revised 250 - 400 word cover letter now.",
    temperature: 0.85,
  });

  const revisedDraft = response.output_text?.trim();
  if (!revisedDraft) {
    throw new Error("No response from LLM during cover letter revision");
  }

  return revisedDraft;
}
