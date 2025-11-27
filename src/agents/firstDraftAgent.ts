import OpenAI from "openai";
import { WritingAnalysis } from "../utils/writing/writingSchema";
import { ITheirStackJob } from "../interfaces/ITheirStackResponse";
import { IUserInfo } from "../interfaces/IUserInfoResponse";

function generatePromptWithWritingAnalysis(
  userData: IUserInfo,
  jobData: ITheirStackJob,
  writingAnalysis: WritingAnalysis | null
) {
  return `You are a cover letter writer.
    Craft a polished, cover letter tailored to the user data, the job/company information, and matching the writing style provided.
    
    **Instructions:**
    - Use all given user and job data WITHOUT inventing any facts.
    - Adapt the tone, voice, vocabulary, and style to CLOSELY MATCH the inputted writing style analysis.
    - Match the tone to the type of company being applied to.

    **Structure the cover letter as follows:**
    1. Name, date, and contact information
    2. Proper greeting **using hiring manager's name if available**
    3. Strong introductory paragraph
    4. 1–2 body paragraphs clearly linking the user’s experience and skills to the job requirements and technologies
    5. Professional closing paragraph
    6. User’s full name as a sign off/signature

    **Requirements:**
    - Reflect the user’s actual background, education, experiences, and projects
    - Map user skills and technologies directly to those specified in the job
    - Personalize the letter
    - Avoid generic fillers or buzzwords
    - Include slight imperfections 
    - Vary sentence length heavily 
    - Add subtle emotional nuance 
    - Avoid overly formal, rigid, or generic phrases

    **Output:**
    - Output a single, fully formatted business cover letter in plain text. 
    - DO NOT OUPUT ANYTHING ELSE. 
    - DO NOT output any explanations or markup. Output ONLY the plain text.
    - Strictly follow the five-part structure above

    ============================================================
    ### USER DATA (JSON)
    \`\`\`json
    ${JSON.stringify(userData, null, 2)}
    \`\`\`
    ============================================================
    ### JOB DATA (JSON)
    \`\`\`json
    ${JSON.stringify(jobData, null, 2)}
    \`\`\`
    ============================================================
    ### WRITING ANALYSIS
    \`\`\`json
    ${JSON.stringify(writingAnalysis, null, 2)}
    \`\`\`

    Output the cover letter as plain text. DO NOT output anything else.`;
}

function generatePromptWithoutWritingAnalysis(
  userData: IUserInfo,
  jobData: ITheirStackJob
) {
  return `You are a cover letter writer.
    Craft a polished, cover letter tailored to the user data and the job/company information.
    
    **Instructions:**
    - Use all given user and job data WITHOUT inventing any facts.
    - Match the tone to the type of company being applied to.

    **Structure the cover letter as follows:**
    1. Name, date, and contact information
    2. Proper greeting **using hiring manager's name if available**
    3. Strong introductory paragraph
    4. 1–2 body paragraphs clearly linking the user’s experience and skills to the job requirements and technologies
    5. Professional closing paragraph
    6. User’s full name as a sign off/signature

    **Requirements:**
    - Reflect the user’s actual background, education, experiences, and projects
    - Map user skills and technologies directly to those specified in the job
    - Personalize the letter
    - Avoid generic fillers or buzzwords
    - Include slight imperfections 
    - Vary sentence length heavily 
    - Add subtle emotional nuance 
    - Avoid overly formal, rigid, or generic phrases

    **Output:**
    - Output a single, fully formatted business cover letter in plain text. 
    - DO NOT OUPUT ANYTHING ELSE. 
    - DO NOT output any explanations or markup. Output ONLY the plain text.
    - Strictly follow the five-part structure above

    ============================================================
    ### USER DATA (JSON)
    \`\`\`json
    ${JSON.stringify(userData, null, 2)}
    \`\`\`
    ============================================================
    ### JOB DATA (JSON)
    \`\`\`json
    ${JSON.stringify(jobData, null, 2)}
    \`\`\`

    Output the cover letter as plain text. DO NOT output anything else.`;
}

export default async function firstDraftAgent(
  clientOpenAI: OpenAI,
  userData: IUserInfo,
  jobData: ITheirStackJob,
  writingAnalysis: WritingAnalysis | null
) {
  const prompt = writingAnalysis
    ? generatePromptWithWritingAnalysis(
        userData,
        jobData,
        writingAnalysis
      ).trim()
    : generatePromptWithoutWritingAnalysis(userData, jobData).trim();

  // generate the draft
  const response = await clientOpenAI.responses.create({
    model: "gpt-5.1",
    input: prompt,
    temperature: 0.85, // Creative enough for human tone
  });

  const draft = response.output_text?.trim();

  if (!draft) {
    throw new Error("No response from LLM during cover letter generation");
  }

  return draft;
}
