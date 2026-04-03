import OpenAI from "openai";
import { IUserInfo } from "../interfaces/IUserInfoResponse";
import { IJobInfo } from "../interfaces/IJobInfo";
import { WritingAnalysis } from "../utils/writing/writingSchema";

function buildPrompt(
  userData: IUserInfo,
  jobData: IJobInfo,
  writingAnalysis: WritingAnalysis | null,
  writingSample: string | null,
  draft: string,
  feedback: string,
): string {
  return `
    Revise the LATEST_DRAFT by implementing the FEEDBACK.

    Use ONLY: USER_DATA, JOB_DATA${writingAnalysis ? ", WRITING_ANALYSIS" : ""}${writingSample ? ", WRITING_SAMPLE" : ""}, LATEST_DRAFT

    Your task:
    Revise the LATEST_DRAFT to address FEEDBACK.

    STRICT LETTER STRUCTURE:
    1. Applicant name + contact info + date
    2. Personalized greeting with hiring manager name if known
    3. Strong intro paragraph
    4. 1 - 2 technical body paragraphs linking user's skills to job requirements
    5. Professional closing paragraph
    6. "Sincerely," + 2 - 4 blank lines + applicant's full name

    HARD REQUIREMENTS:
    - Use the user's real experiences only
    - Map technical skills directly to job requirements
    - Slight imperfections allowed
    - Vary sentence length
    - Keep sentences shorter than 25 words
    - Avoid and buzzwords
    ${writingAnalysis ? "- Match the writing style and tone of WRITING_SAMPLE and WRITING_ANALYSIS if available" : ""}
    - Output ONLY the plain text cover letter
    - Word count: 250 - 400 words
    - Paragraph count: 3 - 5 paragraphs

    USER_DATA:
    ${JSON.stringify(userData, null, 2)}

    JOB_DATA:
    ${JSON.stringify(jobData, null, 2)}

    WRITING_ANALYSIS:
    ${writingAnalysis ? JSON.stringify(writingAnalysis, null, 2) : "null"}

    WRITING_SAMPLE:
    ${writingSample ?? "null"}

    LATEST_DRAFT:
    ${draft}

    FEEDBACK:
    ${feedback}

    Output ONLY the revised plain text cover letter.
  `.trim();
}

export default async function userRevisionAgent(
  clientOpenAI: OpenAI,
  userData: IUserInfo,
  jobData: IJobInfo,
  writingAnalysis: WritingAnalysis | null,
  writingSample: string | null,
  draft: string,
  feedback: string,
): Promise<string> {
  const prompt = buildPrompt(
    userData,
    jobData,
    writingAnalysis,
    writingSample,
    draft,
    feedback,
  );

  const response = await clientOpenAI.responses.create({
    model: "gpt-5.1",
    input: prompt,
    temperature: 0.85,
  });

  const revisedDraft = response.output_text?.trim();

  if (!revisedDraft) {
    throw new Error("No response from LLM during cover letter revision");
  }

  return revisedDraft;
}
