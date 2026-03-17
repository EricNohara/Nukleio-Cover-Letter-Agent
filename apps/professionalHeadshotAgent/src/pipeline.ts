import { generateProfessionalHeadshotAgent } from "./agents/generateProfessionalHeadshotAgent";
import {
  ReferencePhotoValidationResult,
  validateReferencePhotoAgent,
} from "./agents/validateReferencePhotoAgent";
import getOpenAIClient from "./utils/getOpenAIClient";
import { uploadHeadshotToSupabase } from "./utils/uploadHeadshotToSupabase";

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
  // validate the reference image
  const validation: ReferencePhotoValidationResult =
    await validateReferencePhotoAgent(openAIClient, referenceUrl);

  if (!validation.ok) {
    return {
      success: false,
      publicUrl: null,
      error: "Reference image is not suitable for headshot generation.",
      validation,
    };
  }

  // generate the professional headshot
  const headshot = await generateProfessionalHeadshotAgent(
    openAIClient,
    referenceUrl,
    backgroundDescription,
    layout,
    backgroundUrl,
  );

  // upload the headshot to supabase
  const b64Image = headshot.data?.[0]?.b64_json ?? null;

  if (!b64Image) {
    return {
      success: false,
      publicUrl: null,
      error: "OpenAI did not return image data.",
      validation,
    };
  }

  const imageBuffer = Buffer.from(b64Image, "base64");

  const publicUrl = await uploadHeadshotToSupabase(imageBuffer, {
    prefix: "generated",
    contentType: "image/jpeg",
  });

  // return the public url
  return {
    success: publicUrl !== null,
    publicUrl,
    validation,
  };
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
