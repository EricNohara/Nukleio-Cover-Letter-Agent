import { quantitativeSchema, QuantitativeMetrics } from "./writingSchema";

// COMMONJS REQUIRE — THIS IS THE CORRECT WAY FOR THIS LIBRARY
const rs = require("text-readability");

export function analyzeWritingQualitative(text: string): QuantitativeMetrics {
  const wordCount = rs.lexiconCount(text);
  const sentenceCount = rs.sentenceCount(text);
  const totalSyllables = rs.syllableCount(text);
  const avgSentenceLength = wordCount / Math.max(sentenceCount, 1);
  const avgSyllablesPerWord = totalSyllables / Math.max(wordCount, 1);
  const grade = rs.fleschKincaidGrade(text);
  const standard = rs.textStandard(text, true);

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
