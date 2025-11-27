// @ts-ignore
const stopwords = require("stopwords").english;

import { quantitativeSchema, QuantitativeMetrics } from "./writingSchema";

// Load text-readability lazily via dynamic import
async function loadReadability() {
  return await import("text-readability");
}

export async function analyzeWritingQualitative(
  text: string
): Promise<QuantitativeMetrics> {
  const rs = await loadReadability();

  const wordCount = rs.lexiconCount(text);
  const sentenceCount = rs.sentenceCount(text);
  const totalSyllables = rs.syllableCount(text);
  const avgSentenceLength = wordCount / Math.max(sentenceCount, 1);
  const avgSyllablesPerWord = totalSyllables / Math.max(wordCount, 1);
  const fleschKincaidGrade = rs.fleschKincaidGrade(text);
  const textStandard = rs.textStandard(text, true);

  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];

  const stopwordSet = new Set(stopwords);
  const stopwordRatio =
    words.filter((w) => stopwordSet.has(w)).length / Math.max(wordCount, 1);

  const punctuationComplexity =
    (text.match(/[;,:\-—]/g)?.length || 0) / Math.max(sentenceCount, 1);

  return quantitativeSchema.parse({
    avgSentenceLength,
    avgSyllablesPerWord,
    fleschKincaidGrade,
    stopwordRatio,
    punctuationComplexity,
    textStandard,
  });
}
