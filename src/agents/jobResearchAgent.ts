import OpenAI from "openai";
import { ITheirStackJob } from "../interfaces/ITheirStackResponse";
import cleanLLMOutput from "../utils/ai/cleanLLMResponse";

// DO NOT include job title or company name
type LLMExtractedJob = Omit<ITheirStackJob, "job_title" | "company_object"> & {
  company_object: Omit<ITheirStackJob["company_object"], "name">;
};

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

function parseLLMJson<T>(raw: string): T {
  const cleaned = cleanLLMOutput(raw);
  return JSON.parse(cleaned) as T;
}

export default async function jobResearchAgent(
  clientOpenAI: OpenAI,
  jobDescriptionDump: string,
  jobTitle: string,
  companyName: string,
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

  let extracted: LLMExtractedJob;
  try {
    extracted = parseLLMJson<LLMExtractedJob>(rawOutput);
  } catch (err) {
    throw new Error(`Failed to parse LLM output as JSON: ${String(err)}`);
  }

  const jobData: ITheirStackJob = {
    ...extracted,
    job_title: jobTitle,
    company_object: {
      name: companyName,
      industry: extracted.company_object?.industry ?? null,
      long_description: extracted.company_object?.long_description ?? null,
    },
  };

  return jobData;
}
