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
import userRevisionAgent from "./agents/userRevisionAgent";
import { generateCoverLetterPdf } from "./utils/pdf/pdf";

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
  const cleanedWritingSample = writingSample
    ? writingSample.replace(/\s+/g, " ").trim()
    : null;

  const writingAnalysis: WritingAnalysis | null = cleanedWritingSample
    ? await writingAnalysisAgent(clientOpenAI, cleanedWritingSample)
    : null;

  // create a conversation to reuse past inputted data
  const conversationId = await createConversation(
    clientOpenAI,
    userData,
    jobData,
    writingAnalysis,
    cleanedWritingSample ?? null
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
  finalLetter,
}: {
  conversationId: string;
  feedback: string;
  finalLetter?: string | undefined;
}) {
  const clientOpenAI = getOpenAIClient();

  if (!finalLetter) {
    // generate the final draft
    const finalDraft = await userRevisionAgent(
      clientOpenAI,
      conversationId,
      feedback
    );

    // convert the text into pdf
    const pdfBuffer = await generateCoverLetterPdf(finalDraft);

    // return the pdf
    return pdfBuffer;
  } else {
    const pdfBuffer = await generateCoverLetterPdf(finalLetter);
    return pdfBuffer;
  }
}
