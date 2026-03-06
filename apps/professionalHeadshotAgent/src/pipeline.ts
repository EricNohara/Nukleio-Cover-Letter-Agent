import { generateProfessionalHeadshotAgent } from "./agents/generateProfessionalHeadshotAgent";
import getOpenAIClient from "./utils/getOpenAIClient";

const openAIClient = getOpenAIClient();

export async function runPipeline({
  referenceUrl,
  backgroundDescription,
  backgroundUrl,
  layout,
}: {
  referenceUrl: string;
  backgroundDescription: string | null;
  backgroundUrl?: string | undefined;
  layout: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
}) {
  // generate the professional headshot
  const headshot = await generateProfessionalHeadshotAgent(
    openAIClient,
    referenceUrl,
    backgroundDescription,
    layout,
    backgroundUrl,
  );

  // upload the headshot to supabase
  // return the public url
}

export async function runRevisionPipeline({
  headshotUrl,
  feedback,
  layout,
}: {
  headshotUrl: string;
  feedback: string;
  layout: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
}) {
  // fetch headshot from supabase
  // revise the professional headshot
  // upload the headshot to supabase
  // return the public url
}
