import { quantitativeSchema, QuantitativeMetrics } from "./writingSchema";

export async function analyzeWritingQualitative(
  text: string
): Promise<QuantitativeMetrics> {
  const {
    syllableCount,
    sentenceCount,
    lexiconCount,
    fleschKincaidGrade,
    textStandard,
  } = await import("text-readability");

  const wordCount = lexiconCount(text);
  const textSentenceCount = sentenceCount(text);
  const totalSyllables = syllableCount(text);
  const avgSentenceLength = wordCount / Math.max(textSentenceCount, 1);
  const avgSyllablesPerWord = totalSyllables / Math.max(wordCount, 1);
  const grade = fleschKincaidGrade(text);
  const standard = textStandard(text, true);

  const punctuationComplexity =
    (text.match(/[;,:\-—]/g)?.length || 0) / Math.max(textSentenceCount, 1);

  return quantitativeSchema.parse({
    avgSentenceLength,
    avgSyllablesPerWord,
    fleschKincaidGrade: grade,
    punctuationComplexity,
    textStandard: standard,
  });
}
