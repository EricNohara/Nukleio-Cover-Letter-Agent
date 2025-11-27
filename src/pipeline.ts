import getUserData from "./utils/nukleio/getUserData";
import writingAnalysisAgent from "./agents/writingAnalysisAgent";
import { WritingAnalysis } from "./utils/writing/writingSchema";
import getOpenAIClient from "./utils/ai/getOpenAIClient";
import { extractJobFromUrl } from "./utils/web/extractJobFromUrl";
import { ITheirStackJob } from "./interfaces/ITheirStackResponse";
import { IUserInfo } from "./interfaces/IUserInfoResponse";
import firstDraftAgent from "./agents/firstDraftAgent";

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

  // invoke cover letter first draft agent
  const firstDraft: string = await firstDraftAgent(
    clientOpenAI,
    userData,
    jobData,
    writingAnalysis
  );

  let isDraftGoodEnough = true;
  do {
    // invoke draft evaluator agent
    // update isDraftGoodEnough
    // invoke redraft agent
  } while (!isDraftGoodEnough);

  return firstDraft;
}
