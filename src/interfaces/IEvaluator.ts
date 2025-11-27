export interface IObjectiveEvaluationResult {
  pass: boolean; // whether hard checks passed
  issues: string[]; // list of issues found
  stats: {
    wordCount: number;
    paragraphCount: number;
    avgSentenceLength: number;
    longSentenceCount: number;
  };
}
