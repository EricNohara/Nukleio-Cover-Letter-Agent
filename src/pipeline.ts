import getUserData from "./utils/getUserData";
import writingAnalysisAgent from "./agents/writingAnalysisAgent";
import { WritingAnalysis } from "./utils/writing/writingSchema";
import getOpenAIClient from "./utils/getOpenAIClient";

// pipeline for agentic workflow
export async function runPipeline({
  userId,
  jobUrl,
  writingSample,
}: {
  userId: string;
  jobUrl: string;
  writingSample?: string | undefined;
}) {
  // get OpenAI Client
  const clientOpenAI = getOpenAIClient();

  // retrieve user data
  const userData = await getUserData(userId);

  // invoke job research agent

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
