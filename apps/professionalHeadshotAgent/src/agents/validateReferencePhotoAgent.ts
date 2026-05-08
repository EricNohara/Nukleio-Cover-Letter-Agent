import OpenAI from "openai";

export type ReferencePhotoValidationResult = {
  ok: boolean;
  failureReasons: string[];
  warnings: string[];
  detected: {
    personCount: number;
    faceVisible: boolean;
    faceTooCropped: boolean;
    lookingAtCamera: boolean;
    nonPhotographic: boolean;
    nsfwContent: boolean;
    tooBlurry: boolean;
  };
};

type RawReferencePhotoValidationResult = Omit<
  ReferencePhotoValidationResult,
  "ok"
>;

function buildPrompt() {
  return `
    You are validating an uploaded image to see if its suitable as a reference photo for generating a realistic professional headshot.

    Be permissive. Only fail the image if it is truly unusable or unsafe.
    The image does NOT need to already look professional. Casual selfies, imperfect lighting, non-professional backgrounds, off-center framing, and minor blur are acceptable.

    Fill out the provided reference_photo_validation JSON with your scoring of the reference image.

    Add to failureReasons if any of these are true:
    - no person is visible
    - more than one person is clearly centered and visible
    - the face is not visible enough to preserve identity
    - the face is so heavily cropped that key identity features are missing
    - the image is extremely blurry or extremely low resolution
    - the image is not a real photo, such as a drawing, cartoon, avatar, render, or screenshot
    - the image contains NSFW content

    Add warnings for fixable or soft issues:
    - casual photo
    - messy or non-professional background
    - mediocre lighting
    - slight blur
    - face slightly cropped
    - not fully facing camera
    - not looking directly at camera
    - glasses, hat, or mild occlusion
    - off-center framing
    - lower image quality, but still usable

    Return strict JSON with:
    - failureReasons
    - warnings
    - detected
    `.trim();
}

function computeOk(result: RawReferencePhotoValidationResult): boolean {
  if (result.failureReasons.length > 0) return false;

  if (result.detected.personCount !== 1) return false;
  if (!result.detected.faceVisible) return false;
  if (result.detected.faceTooCropped) return false;
  if (result.detected.nonPhotographic) return false;
  if (result.detected.nsfwContent) return false;
  if (result.detected.tooBlurry) return false;

  return true;
}

export async function validateReferencePhotoAgent(
  openAIClient: OpenAI,
  referenceUrl: string,
): Promise<ReferencePhotoValidationResult> {
  const response = await openAIClient.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: buildPrompt(),
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Validate this image for use as a professional headshot reference photo.",
          },
          {
            type: "input_image",
            image_url: referenceUrl,
            detail: "high",
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "reference_photo_validation",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            failureReasons: {
              type: "array",
              items: { type: "string" },
            },
            warnings: {
              type: "array",
              items: { type: "string" },
            },
            detected: {
              type: "object",
              additionalProperties: false,
              properties: {
                personCount: { type: "number" },
                faceVisible: { type: "boolean" },
                faceTooCropped: { type: "boolean" },
                lookingAtCamera: { type: "boolean" },
                nonPhotographic: { type: "boolean" },
                nsfwContent: { type: "boolean" },
                tooBlurry: { type: "boolean" },
              },
              required: [
                "personCount",
                "faceVisible",
                "faceTooCropped",
                "lookingAtCamera",
                "nonPhotographic",
                "nsfwContent",
                "tooBlurry",
              ],
            },
          },
          required: ["failureReasons", "warnings", "detected"],
        },
      },
    },
  });

  const text = response.output_text;

  if (!text) {
    throw new Error("OpenAI did not return validation output.");
  }

  const parsed = JSON.parse(text) as RawReferencePhotoValidationResult;

  return {
    ok: computeOk(parsed),
    ...parsed,
  };
}
