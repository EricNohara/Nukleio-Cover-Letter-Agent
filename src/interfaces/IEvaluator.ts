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

export interface ILlmEvaluationResult {
  score: number; // 0–100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface IWritingStyleEvaluationResult {
  deviations: {
    metric: string;
    userValue: number;
    draftValue: number;
    difference: number;
    severity: "low" | "medium" | "high";
    status: "matches" | "draft_higher" | "draft_lower";
  }[];
  summary: string[];
}

export interface IDraftEvaluationResult {
  objectiveEvaluation: IObjectiveEvaluationResult;
  llmEvaluation: ILlmEvaluationResult;
  writingStyleEvaluation: IWritingStyleEvaluationResult | null;
}
