import { quantitativeSchema, QuantitativeMetrics } from "./writingSchema";

// Load text-readability lazily via dynamic import
async function loadReadability() {
  // All exported functions are inside the default export
  const mod = await import("text-readability");
  return mod.default || mod; // defensive fallback
}

export async function analyzeWritingQualitative(
  text: string
): Promise<QuantitativeMetrics> {
  const rs = await loadReadability();

  // NOW these functions exist
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
