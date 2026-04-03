import getUserData from "./utils/nukleio/getUserData";
import writingAnalysisAgent from "./agents/writingAnalysisAgent";
import { WritingAnalysis } from "./utils/writing/writingSchema";
import getOpenAIClient from "./utils/ai/getOpenAIClient";
import { IUserInfo } from "./interfaces/IUserInfoResponse";
import firstDraftAgent from "./agents/firstDraftAgent";
import { IDraftEvaluationResult } from "./interfaces/IEvaluator";
import draftEvaluatorAgent from "./agents/draftEvaluatorAgent";
import revisionAgent from "./agents/revisionAgent";
import userRevisionAgent from "./agents/userRevisionAgent";
import OpenAI from "openai";
import jobResearchAgent from "./agents/jobResearchAgent";
import skillsMatchEvaluatorAgent from "./agents/skillsMatchEvaluatorAgent";
import revisionDraftNamingAgent from "./agents/revisionDraftNamingAgent";
import { IJobInfo } from "./interfaces/IJobInfo";
import { userDataFilteringAgent } from "./agents/userDataFilteringAgent";
import { getCoverLetterSession } from "./utils/nukleio/getCoverLetterSession";

const MAX_ITERATIONS = 2;

async function runCorePipeline({
  clientOpenAI,
  userData,
  jobData,
  writingSample,
}: {
  clientOpenAI: OpenAI;
  userData: IUserInfo;
  jobData: IJobInfo;
  writingSample?: string | undefined;
}) {
  // invoke writing analysis agent
  const cleanedWritingSample = writingSample
    ? writingSample.replace(/\s+/g, " ").trim()
    : null;

  const writingAnalysis: WritingAnalysis | null = cleanedWritingSample
    ? await writingAnalysisAgent(clientOpenAI, cleanedWritingSample)
    : null;

  // invoke cover letter first draft agent
  let currentDraft: string = await firstDraftAgent(
    clientOpenAI,
    userData,
    jobData,
    writingAnalysis,
    writingSample,
  );

  // evaluation feedback loop
  let lastEvaluation: IDraftEvaluationResult;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    // evaluate current draft
    lastEvaluation = await draftEvaluatorAgent(
      clientOpenAI,
      currentDraft,
      userData,
      jobData,
      writingAnalysis,
      writingSample,
    );

    // Determine pass/fail
    const objectivePass =
      lastEvaluation.objectiveEvaluation.pass &&
      lastEvaluation.objectiveEvaluation.issues.length === 0;

    const llmPass = lastEvaluation.llmEvaluation.score >= 80;

    const stylePass = lastEvaluation.writingStyleEvaluation
      ? lastEvaluation.writingStyleEvaluation.deviations.every(
          (d) => d.severity !== "high",
        )
      : true;

    const isPassed = objectivePass && llmPass && stylePass;

    if (isPassed) break; // success

    // Produce revised draft
    currentDraft = await revisionAgent(
      clientOpenAI,
      lastEvaluation,
      currentDraft,
      userData,
      jobData,
      writingAnalysis,
      writingSample,
    );
  }

  // calculate skills match score at the end
  const skillsMatchScore = await skillsMatchEvaluatorAgent(
    clientOpenAI,
    userData,
    jobData,
  );

  // return things needed to store session
  return {
    jobData,
    writingAnalysis,
    writingSample,
    currentDraft,
    skillsMatchScore,
  };
}

// pipeline for job research agentic workflow
export async function runPipeline({
  userId,
  jobTitle,
  companyName,
  jobDescriptionDump,
  writingSample,
}: {
  userId: string;
  jobTitle: string;
  companyName: string;
  jobDescriptionDump: string;
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
  const jobData: IJobInfo = await jobResearchAgent(
    clientOpenAI,
    jobDescriptionDump,
    jobTitle,
    companyName,
  );

  if (!jobData) {
    throw new Error("Failed to research inputted job. Please try again.");
  }

  // filter user data for the job
  const filteredUserData: IUserInfo = await userDataFilteringAgent(
    clientOpenAI,
    userData,
    jobData,
  );

  return await runCorePipeline({
    clientOpenAI,
    userData: filteredUserData,
    jobData,
    writingSample,
  });
}

// for one shot user revisions
export async function runRevisionPipeline({
  userId,
  sessionId,
  feedback,
}: {
  userId: string;
  sessionId: string;
  feedback: string;
}) {
  const clientOpenAI = getOpenAIClient();

  // get user info
  const userData = await getUserData(userId);
  if (!userData) {
    throw new Error(`User with id ${userId} not found.`);
  }

  // retrieve data from session
  const session = await getCoverLetterSession(userId, sessionId);

  // generate the revised draft
  const revisedDraft = await userRevisionAgent(
    clientOpenAI,
    userData,
    session.jobData,
    session.writingAnalysis,
    session.writingSample,
    session.currentDraft,
    feedback,
  );

  // generate the draft name from revision
  const draftName = await revisionDraftNamingAgent(clientOpenAI, feedback);

  return {
    revisedDraft,
    draftName,
    jobData: session.jobData,
    writingAnalysis: session.writingAnalysis,
    writingSample: session.writingSample,
  };
}
