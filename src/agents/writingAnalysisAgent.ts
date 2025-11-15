import {
  writingAnalysisSchema,
  WritingAnalysis,
  QuantitativeMetrics,
  QualitativeMetrics,
  qualitativeSchema,
} from "../utils/writing/writingSchema";
import { analyzeWritingQualitative } from "../utils/writing/textMetrics";
import "dotenv/config";
import cleanLLMOutput from "../utils/cleanLLMResponse";
import OpenAI from "openai";

export default async function writingAnalysisAgent(
  clientOpenAI: OpenAI,
  sample: string
): Promise<WritingAnalysis> {
  if (!sample.trim()) {
    throw new Error("Writing sample is empty");
  }

  const prompt = `
    Analyze the following writing sample and return ONLY valid JSON matching this schema EXACTLY.
    Do NOT include explanations, extra commentary, or numeric readability metrics.

    Schema:
    {
      "tone": {
        "formality": "formal | casual | professional | conversational",
        "confidence": "tentative | assertive | persuasive",
        "sentiment": "positive | neutral | negative"
      },
      "sentencePatterns": {
        "structure": "simple | compound | complex | mixed",
        "variedPacing": "low | medium | high"
      },
      "vocabulary": {
        "distinctiveWords": [],  // uncommon or stylistically unique words
        "repeatedPhrases": []    // common phrases or idioms
      },
      "cohesion": {
        "paragraphLength": "short | medium | long",
        "connectors": []         // e.g., 'however', 'therefore', 'meanwhile'
      }
    }

    Writing Sample:
    """
    ${sample}
    """

    Output ONLY JSON and nothing else. If there is extra text, the response will be rejected.
  `;

  // quantitative analysis
  const quantMetrics: QuantitativeMetrics = analyzeWritingQualitative(sample);

  // qualitative analysis
  const response = await clientOpenAI.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  const rawOutput = response.choices?.[0]?.message?.content?.trim();
  if (!rawOutput) {
    throw new Error("No response from LLM during writing style analysis");
  }

  let qualMetrics: QualitativeMetrics;
  try {
    const cleaned = cleanLLMOutput(rawOutput);
    qualMetrics = qualitativeSchema.parse(JSON.parse(cleaned));
  } catch (err) {
    throw new Error(`Failed to parse LLM output as JSON: ${err}`);
  }

  // build and return final output
  const combinedMetrics: WritingAnalysis = writingAnalysisSchema.parse({
    ...quantMetrics,
    ...qualMetrics,
  });

  return combinedMetrics;
}
