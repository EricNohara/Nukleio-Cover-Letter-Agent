import OpenAI from "openai";
import { ITheirStackJob } from "../interfaces/ITheirStackResponse";
import cleanLLMOutput from "../utils/ai/cleanLLMResponse";

function generatePrompt(jobDescriptionDump: string) {
  return `You are a job description extraction system.

TASK:
- Parse the following job description and output EXACTLY ONE JSON object matching the schema below EXACTLY.
- Do NOT include any commentary, explanations, or text outside the JSON.
- If a field is missing or cannot be inferred, set it to null or an empty array as appropriate.

TARGET JSON SCHEMA (fill all fields):

{
  "url": string | null,
  "final_url": string | null,
  "source_url": string | null,
  "job_title": string,
  "remote": boolean | null,
  "hybrid": boolean | null,
  "seniority": string | null,
  "hiring_team": [
    {
      "full_name": string | null,
      "linkedin_url": string | null,
      "role": string | null
    }
  ],
  "employment_statuses": string[],
  "technology_slugs": string[],
  "description": string,
  "company_object": {
    "name": string,
    "industry": string | null,
    "long_description": string | null
  },
  "locations": [
    {
      "display_name": string | null
    }
  ]
}

RETURN ONLY VALID JSON. NO MARKDOWN.

JOB DESCRIPTION TO PARSE:
--------------------------------
${jobDescriptionDump}
--------------------------------
  `.trim();
}

export default async function jobDescriptionParserAgent(
  clientOpenAI: OpenAI,
  jobDescriptionDump: string
): Promise<ITheirStackJob> {
  const prompt = generatePrompt(jobDescriptionDump);

  // generate the json data
  const completion = await clientOpenAI.chat.completions.create({
    model: "gpt-5.1",
    messages: [
      { role: "system", content: "You extract structured JSON from text." },
      { role: "user", content: prompt },
    ],
    temperature: 0, // deterministic extraction
  });

  const rawOutput = completion.choices?.[0]?.message?.content?.trim();
  if (!rawOutput) {
    throw new Error("No response from LLM during writing style analysis");
  }

  let jobData: ITheirStackJob;
  try {
    const cleaned = cleanLLMOutput(rawOutput);
    jobData = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse LLM output as JSON: ${err}`);
  }

  return jobData;
}
