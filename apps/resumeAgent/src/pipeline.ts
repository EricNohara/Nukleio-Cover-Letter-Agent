import getUserData from "./utils/getUserData";
import { renderResumeHtml } from "./utils/renderResumeHtml";
import { renderResumePdf } from "./utils/renderResumePdf";
import { uploadResumeToSupabase } from "./utils/uploadResumeToSupabase";
import getOpenAIClient from "./utils/getOpenAIClient";
import { IUserInfo } from "./interfaces/IUserInfoResponse";
import { enhanceResumeUserInfoAgent } from "./agents/enhanceResumeUserInfoAgent";

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
  userInfo: IUserInfo,
  templateId?: string | undefined,
) {
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

  return resumeUrl;
}

export async function runGeneratePipeline({
  userId,
  templateId,
  educationIds,
  courseIds,
  experienceIds,
  projectIds,
  skillIds,
}: {
  userId: string;
  templateId?: string | undefined;
  educationIds?: string[] | undefined;
  courseIds?: string[] | undefined;
  experienceIds?: string[] | undefined;
  projectIds?: string[] | undefined;
  skillIds?: string[] | undefined;
}): Promise<{
  success: true;
  resumeUrl: string;
}> {
  // fetch user info
  const userInfo = await getUserData(
    userId,
    educationIds,
    courseIds,
    experienceIds,
    projectIds,
    skillIds,
  );
  if (!userInfo) {
    throw new Error("Error fetching user info");
  }

  const resumeUrl = await generateResumeFromUserInfoAndTemplate(
    userId,
    userInfo,
    templateId,
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
  templateId,
  targetJobs,
}: {
  userId: string;
  templateId?: string | undefined;
  targetJobs?: string[] | undefined;
}) {
  // fetch ALL user info
  const userInfo = await getUserData(userId);
  if (!userInfo) {
    throw new Error("Error fetching user info");
  }

  // run the enhancement agent
  const resumeEnhancedUserInfo: IUserInfo = await enhanceResumeUserInfoAgent(
    openAIClient,
    userInfo,
    targetJobs,
  );

  // generate the resume
  const resumeUrl = await generateResumeFromUserInfoAndTemplate(
    userId,
    resumeEnhancedUserInfo,
    templateId,
  );

  if (!resumeUrl) {
    throw new Error("Failed to upload generated resume");
  }

  return {
    success: true,
    resumeUrl,
  };
}
