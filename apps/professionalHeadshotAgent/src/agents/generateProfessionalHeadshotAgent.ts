import OpenAI from "openai";
import { urlToOpenAIFile } from "../utils/urlToOpenAiFile";

function buildPrompt(
  backgroundDescription: string | null,
  hasBackgroundImage: boolean,
) {
  if (hasBackgroundImage) {
    return `
        You are a professional photographer that creates realistic professional headshots.
        Use the first input image as the subject reference.
        Use the second input image as the background reference.
        Create a realistic professional headshot of the subject while preserving facial identity, skin tone, and general likeness.
        Blend the subject naturally into the provided background image.
        Improve lighting, polish, and professionalism while keeping the subject natural.
        The output should look like a high-quality corporate or LinkedIn-style headshot.
        There should only be a single subject in the final image.
        Do not add extra people, extra limbs, text, watermarks, or distortions.
    `.trim();
  }

  return `
    You are a professional photographer that creates realistic professional headshots.
    Create a realistic professional headshot of the subject in the reference image.
    Preserve the person's facial identity, skin tone, and general likeness.
    Improve lighting, polish, and professionalism while keeping the subject natural.
    Background setting: ${backgroundDescription ?? "professional neutral studio background"}.
    The output should look like a high-quality corporate or LinkedIn-style headshot.
    There should only be a single subject in the final image.
    Do not add extra people, extra limbs, text, watermarks, or distortions.
`.trim();
}

export async function generateProfessionalHeadshotAgent(
  openAIClient: OpenAI,
  referenceUrl: string,
  backgroundDescription: string | null,
  layout: "1024x1024" | "1536x1024" | "1024x1536" | "auto",
  backgroundUrl?: string,
) {
  const hasBackgroundImageInput = Boolean(backgroundUrl);
  const prompt = buildPrompt(backgroundDescription, hasBackgroundImageInput);
  const referenceImageFile = await urlToOpenAIFile(
    referenceUrl,
    "referenceImage.png",
  );

  let imageInput:
    | Awaited<ReturnType<typeof urlToOpenAIFile>>
    | Awaited<ReturnType<typeof urlToOpenAIFile>>[];

  if (hasBackgroundImageInput && backgroundUrl) {
    const backgroundImageFile = await urlToOpenAIFile(
      backgroundUrl,
      "backgroundImage.png",
    );
    imageInput = [referenceImageFile, backgroundImageFile];
  } else {
    imageInput = referenceImageFile;
  }

  const response = await openAIClient.images.edit({
    model: "gpt-image-1.5",
    image: imageInput,
    prompt,
    size: layout,
    output_format: "jpeg",
    input_fidelity: "high",
    output_compression: 75,
  });

  return response;
}
