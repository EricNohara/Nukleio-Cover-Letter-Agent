import getOpenAIClient from "./utils/getOpenAIClient";

const openAIClient = getOpenAIClient();

export async function runPipeline({
  userId,
  templateId,
}: {
  userId: string;
  templateId?: string | undefined;
}) {}

export async function runEnhancementPipeline({
  userId,
  resumeUrl,
  feedback,
}: {
  userId: string;
  resumeUrl: string;
  feedback?: string | undefined;
}) {}
