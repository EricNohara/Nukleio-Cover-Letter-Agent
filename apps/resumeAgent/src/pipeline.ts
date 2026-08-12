import { renderResumeHtml } from "./utils/renderResumeHtml";
import { renderResumePdf } from "./utils/renderResumePdf";
import { uploadResumeToSupabase } from "./utils/uploadResumeToSupabase";
import getOpenAIClient from "./utils/getOpenAIClient";
import { enhanceResumeUserInfoAgent } from "./agents/enhanceResumeUserInfoAgent";
import { UserInfo } from "./types/userInfo";

const openAIClient = getOpenAIClient();

function makeSafePrefix(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "resume";
}

async function generateResumeFromUserInfoAndTemplate(
  userId: string,
  userInfo: UserInfo,
  templateId?: string | undefined
) {
  //   render the resume as HTML
  const html = renderResumeHtml(userInfo, templateId);

  //   render the HTML resume as a PDF
  const pdfBuffer = await renderResumePdf(html);

  //   upload the resume to supabase and return the public url
  const safePrefix = makeSafePrefix(userInfo.name ?? userInfo.email);

  const resumeUrl = await uploadResumeToSupabase(pdfBuffer, {
    userId,
    fileNamePrefix: `${safePrefix}-resume`,
    contentType: "application/pdf",
  });

  return resumeUrl;
}

export async function runGeneratePipeline({
  userId,
  userInfo,
  templateId,
}: {
  userId: string;
  userInfo: UserInfo;
  templateId?: string | undefined;
}): Promise<{
  success: true;
  resumeUrl: string;
}> {
  const resumeUrl = await generateResumeFromUserInfoAndTemplate(
    userId,
    userInfo,
    templateId
  );

  if (!resumeUrl) {
    throw new Error("Failed to upload generated resume");
  }

  return {
    success: true,
    resumeUrl,
  };
}

export async function runGenerateWithAiPipeline({
  userId,
  userInfo,
  templateId,
  targetJobs,
}: {
  userId: string;
  userInfo: UserInfo;
  templateId?: string | undefined;
  targetJobs?: string[] | undefined;
}) {
  // run the enhancement agent
  const resumeEnhancedUserInfo: UserInfo = await enhanceResumeUserInfoAgent(
    openAIClient,
    userInfo,
    targetJobs
  );

  // generate the resume
  const resumeUrl = await generateResumeFromUserInfoAndTemplate(
    userId,
    resumeEnhancedUserInfo,
    templateId
  );

  if (!resumeUrl) {
    throw new Error("Failed to upload generated resume");
  }

  return {
    success: true,
    resumeUrl,
  };
}
