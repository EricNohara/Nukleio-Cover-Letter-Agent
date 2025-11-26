import getUserData from "./utils/getUserData";
import writingAnalysisAgent from "./agents/writingAnalysisAgent";
import { WritingAnalysis } from "./utils/writing/writingSchema";
import getOpenAIClient from "./utils/getOpenAIClient";
import { extractJobFromUrl } from "./utils/web/extractJobFromUrl";

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
  const userData = await getUserData(userId);

  // invoke job research agent
  const jobData = await extractJobFromUrl(jobUrl, jobTitle, companyName);

  // invoke writing analysis agent
  const writingAnalysis: WritingAnalysis | null = writingSample
    ? await writingAnalysisAgent(clientOpenAI, writingSample)
    : null;

  // invoke cover letter first draft agent

  let isDraftGoodEnough = false;
  do {
    // invoke draft evaluator agent
    // update isDraftGoodEnough
    // invoke redraft agent
  } while (!isDraftGoodEnough);

  // format the draft as a pdf

  // return the pdf file
}
