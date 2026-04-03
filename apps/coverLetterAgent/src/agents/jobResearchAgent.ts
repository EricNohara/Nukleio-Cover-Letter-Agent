import OpenAI from "openai";
import { IJobInfo, IJobInfoLlmResponse } from "../interfaces/IJobInfo";

function removeEmptyFields<T>(value: T): T {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => removeEmptyFields(item))
      .filter((item) => {
        if (item === undefined || item === null || item === "") return false;
        if (Array.isArray(item) && item.length === 0) return false;
        if (
          typeof item === "object" &&
          item !== null &&
          !Array.isArray(item) &&
          Object.keys(item).length === 0
        ) {
          return false;
        }
        return true;
      });

    return cleaned as T;
  }

  if (value && typeof value === "object") {
    const cleanedEntries = Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => [key, removeEmptyFields(val)] as const)
      .filter(([, val]) => {
        if (val === undefined || val === null || val === "") return false;
        if (Array.isArray(val) && val.length === 0) return false;
        if (
          typeof val === "object" &&
          val !== null &&
          !Array.isArray(val) &&
          Object.keys(val).length === 0
        ) {
          return false;
        }
        return true;
      });

    return Object.fromEntries(cleanedEntries) as T;
  }

  return value;
}

const jobInfoSchema = {
  name: "job_info_extraction",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      role_summary: {
        type: "string",
        description: "Short role summary. Max 2 sentences, 300 characters.",
      },
      work_mode: {
        type: "string",
        enum: ["remote", "hybrid", "onsite"],
      },
      locations: {
        type: "array",
        items: { type: "string" },
      },
      qualifications: {
        type: "array",
        items: { type: "string" },
      },
      responsibilities: {
        type: "array",
        items: { type: "string" },
      },
      technologies: {
        type: "array",
        items: { type: "string" },
      },
      company: {
        type: "object",
        additionalProperties: false,
        properties: {
          industry: { type: "string" },
          company_summary: {
            type: "string",
            description:
              "Short company summary. Max 2 sentence, 300 characters.",
          },
        },
        required: [],
      },
      hiring_team: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
          },
          required: [],
        },
      },
    },
    required: [],
  },
} as const;

function buildPrompt() {
  return `
    Extract structured job info from pasted job text for a cover-letter drafting agent.
    
    RULES:
    - Return ONLY supported fields.
    - Omit missing, uncertain, redundant fields.
    - Be concise, keeping only the most IMPORTANT info.
    - Include work_mode only if clearly supported by the text.
    - Ignore perks, testimonials, compensation, and marketing unless useful for understanding the role.

    CONSTRAINTS:
    - role_summary: max 2 sentences, 300 characters. Do NOT copy large blocks from the posting.
    - company.company_summary: max 2 sentences, 300 characters. Do NOT copy large blocks from the posting.
    - qualifications: max 5
    - responsibilities: max 5
    - technologies: max 10
    - locations: max 5
  `.trim();
}

export default async function jobResearchAgent(
  clientOpenAI: OpenAI,
  jobDescriptionDump: string,
  jobTitle: string,
  companyName: string,
): Promise<IJobInfo> {
  const prompt = buildPrompt();

  const completion = await clientOpenAI.chat.completions.create({
    model: "gpt-5.1",
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: jobInfoSchema,
    },
    messages: [
      {
        role: "developer",
        content: prompt,
      },
      {
        role: "user",
        content: jobDescriptionDump,
      },
    ],
  });

  const rawOutput = completion.choices?.[0]?.message?.content?.trim();
  if (!rawOutput) {
    throw new Error("No response from LLM during job info extraction");
  }

  let extracted: IJobInfoLlmResponse;
  try {
    extracted = JSON.parse(rawOutput) as IJobInfoLlmResponse;
  } catch (err) {
    throw new Error(`Failed to parse structured job info JSON: ${String(err)}`);
  }

  const cleaned = removeEmptyFields<IJobInfoLlmResponse>(extracted);

  const jobInfo: IJobInfo = removeEmptyFields<IJobInfo>({
    ...cleaned,
    job_title: jobTitle,
    company: removeEmptyFields({
      name: companyName,
      ...(cleaned.company ?? {}),
    }),
  });

  return jobInfo;
}
