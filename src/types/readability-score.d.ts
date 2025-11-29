declare module "text-readability" {
  interface TextReadability {
    syllableCount(text: string, lang?: string): number;
    lexiconCount(text: string, removePunctuation?: boolean): number;
    sentenceCount(text: string): number;

    fleschReadingEase(text: string): number;
    fleschKincaidGrade(text: string): number;
    gunningFog(text: string): number;
    smogIndex(text: string): number;
    automatedReadabilityIndex(text: string): number;
    colemanLiauIndex(text: string): number;
    linsearWriteFormula(text: string): number;
    daleChallReadabilityScore(text: string): number;

    textStandard(text: string, float_output?: boolean): number;
  }

  const rs: TextReadability;
  export = rs;
}
