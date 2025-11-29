import { quantitativeSchema, QuantitativeMetrics } from "./writingSchema";
import Readability from "readability-score";

export function analyzeWritingQualitative(text: string): QuantitativeMetrics {
  const r = new Readability(text);

  const wordCount = r.lexiconCount();
  const sentenceCount = r.sentenceCount();
  const totalSyllables = r.syllableCount();

  const avgSentenceLength = wordCount / Math.max(sentenceCount, 1);
  const avgSyllablesPerWord = totalSyllables / Math.max(wordCount, 1);
  const grade = r.fleschKincaidGradeLevel();
  const standard = r.textStandard();
  const punctuationComplexity =
    (text.match(/[;,:\-—]/g)?.length || 0) / Math.max(sentenceCount, 1);

  return quantitativeSchema.parse({
    avgSentenceLength,
    avgSyllablesPerWord,
    fleschKincaidGrade: grade,
    punctuationComplexity,
    textStandard: standard,
  });
}
