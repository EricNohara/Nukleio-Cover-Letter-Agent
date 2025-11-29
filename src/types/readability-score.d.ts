declare module "readability-score" {
  export default class Readability {
    constructor(text: string);

    lexiconCount(ignoreNumbers?: boolean): number;
    syllableCount(text?: string): number;
    sentenceCount(): number;

    fleschReadingEase(): number;
    fleschKincaidGradeLevel(): number;
    automatedReadabilityIndex(): number;
    colemanLiauIndex(): number;
    smogIndex(): number;
    gunningFogScore(): number;

    textStandard(
      formatOutput?: boolean | undefined,
      useFraction?: boolean | undefined
    ): number | string;
  }
}
