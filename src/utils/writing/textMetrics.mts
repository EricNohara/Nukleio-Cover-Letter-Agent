import { quantitativeSchema, QuantitativeMetrics } from "./writingSchema";
import * as rs from "text-readability";

export function analyzeWritingQualitative(text: string): QuantitativeMetrics {
  const wordCount = rs.lexiconCount(text);
  const sentenceCount = rs.sentenceCount(text);
  const totalSyllables = rs.syllableCount(text);
  const avgSentenceLength = wordCount / Math.max(sentenceCount, 1);
  const avgSyllablesPerWord = totalSyllables / Math.max(wordCount, 1);
  const fleschKincaidGrade = rs.fleschKincaidGrade(text);
  const textStandard = rs.textStandard(text, true);

  const punctuationComplexity =
    (text.match(/[;,:\-—]/g)?.length || 0) / Math.max(sentenceCount, 1);

  return quantitativeSchema.parse({
    avgSentenceLength,
    avgSyllablesPerWord,
    fleschKincaidGrade,
    punctuationComplexity,
    textStandard,
  });
}
