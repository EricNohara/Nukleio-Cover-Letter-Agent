import getUserData from "./utils/nukleio/getUserData";
import writingAnalysisAgent from "./agents/writingAnalysisAgent";
import { WritingAnalysis } from "./utils/writing/writingSchema";
import getOpenAIClient from "./utils/ai/getOpenAIClient";
import { extractJobFromUrl } from "./utils/web/extractJobFromUrl";
import { ITheirStackJob } from "./interfaces/ITheirStackResponse";
import { IUserInfo } from "./interfaces/IUserInfoResponse";
import firstDraftAgent from "./agents/firstDraftAgent";
import { Conversation } from "openai/resources/conversations/conversations";

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
  const conversation: Conversation = await clientOpenAI.conversations.create({
    metadata: { topic: "cover_letter_pipeline" },
    items: [
      {
        type: "message",
        role: "system",
        content: [
          { type: "input_text", text: "User data:" },
          { type: "input_text", text: JSON.stringify(userData) },
        ],
      },
      {
        type: "message",
        role: "system",
        content: [
          { type: "input_text", text: "Job data:" },
          { type: "input_text", text: JSON.stringify(jobData) },
        ],
      },
      {
        type: "message",
        role: "system",
        content: [
          { type: "input_text", text: "Writing analysis:" },
          { type: "input_text", text: JSON.stringify(writingAnalysis) },
        ],
      },
    ],
  });

  const conversationId = conversation.id;

  // invoke cover letter first draft agent
  const firstDraft: string = await firstDraftAgent(
    clientOpenAI,
    conversationId,
    writingAnalysis
  );

  let isDraftGoodEnough = true;
  let iterationCount = 0;
  const maxIterations = 3;
  do {
    // invoke draft evaluator agent
    // update isDraftGoodEnough
    // invoke redraft agent
  } while (!isDraftGoodEnough && iterationCount < maxIterations);

  return firstDraft;
}
