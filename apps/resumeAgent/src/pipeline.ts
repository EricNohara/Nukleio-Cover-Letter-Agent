import getUserData from "./utils/getUserData";
import { renderResumeHtml } from "./utils/renderResumeHtml";
import { renderResumePdf } from "./utils/renderResumePdf";
import { uploadResumeToSupabase } from "./utils/uploadResumeToSupabase";

function makeSafePrefix(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "resume";
}

export async function runPipeline({
  userId,
  templateId,
}: {
  userId: string;
  templateId?: string | undefined;
}): Promise<{
  success: true;
  resumeUrl: string;
}> {
  // fetch user info
  const userInfo = await getUserData(userId);

  if (!userInfo) {
    throw new Error("Error fetching user info");
  }

  //   render the resume as HTML
  const html = renderResumeHtml(userInfo, templateId);

  //   render the HTML resume as a PDF
  const pdfBuffer = await renderResumePdf(html);

  //   upload the resume to supabase and return the public url
  const safePrefix = makeSafePrefix(userInfo.name ?? userInfo.email);

  const resumeUrl = await uploadResumeToSupabase(pdfBuffer, {
    prefix: userId,
    fileNamePrefix: `${safePrefix}-resume`,
    contentType: "application/pdf",
  });

  if (!resumeUrl) {
    throw new Error("Failed to upload generated resume");
  }

  return {
    success: true,
    resumeUrl,
  };
}

export async function runEnhancementPipeline({
  userId,
  resumeUrl,
  feedback,
}: {
  userId: string;
  resumeUrl: string;
  feedback?: string | undefined;
}) {
  throw new Error("Enhancement pipeline not implemented yet");
}
