import { quantitativeSchema, QuantitativeMetrics } from "./writingSchema";
import {
  syllableCount,
  sentenceCount,
  lexiconCount,
  fleschKincaidGrade,
  textStandard,
} from "text-readability";

export function analyzeWritingQualitative(text: string): QuantitativeMetrics {
  const wordCount = lexiconCount(text);
  const textSentenceCount = sentenceCount(text);
  const totalSyllables = syllableCount(text);
  const avgSentenceLength = wordCount / Math.max(textSentenceCount, 1);
  const avgSyllablesPerWord = totalSyllables / Math.max(wordCount, 1);
  const textFleschKincaidGrade = fleschKincaidGrade(text);
  const standard = textStandard(text, true);

  const punctuationComplexity =
    (text.match(/[;,:\-—]/g)?.length || 0) / Math.max(textSentenceCount, 1);

  return quantitativeSchema.parse({
    avgSentenceLength,
    avgSyllablesPerWord,
    textFleschKincaidGrade,
    punctuationComplexity,
    standard,
  });
}
