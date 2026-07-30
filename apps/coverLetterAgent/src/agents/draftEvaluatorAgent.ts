import OpenAI from "openai";
import { objectiveEvaluator } from "../utils/eval/objectiveEvaluator";
import { WritingAnalysis } from "../types/writingAnalysis";
import {
  IDraftEvaluationResult,
  ILlmEvaluationResult,
  IObjectiveEvaluationResult,
  IWritingStyleEvaluationResult,
} from "../interfaces/IEvaluator";
import llmEvaluator from "../utils/eval/llmEvaluator";
import writingStyleEvaluator from "../utils/eval/writingStyleEvaluator";
import { IJobInfo } from "../interfaces/IJobInfo";
import { UserInfo } from "../types/userInfo";

export default async function draftEvaluatorAgent(
  clientOpenAI: OpenAI,
  draft: string,
  userInfo: UserInfo,
  jobData: IJobInfo,
  writingAnalysis: WritingAnalysis | null,
  writingSample?: string | undefined,
): Promise<IDraftEvaluationResult> {
  const objectiveEvaluation: IObjectiveEvaluationResult =
    await objectiveEvaluator(draft, userInfo, jobData);

  const llmEvaluation: ILlmEvaluationResult = await llmEvaluator(
    clientOpenAI,
    draft,
    userInfo,
    jobData,
    writingAnalysis,
    writingSample,
  );

  const writingStyleEvaluation: IWritingStyleEvaluationResult | null =
    await writingStyleEvaluator(clientOpenAI, draft, writingAnalysis);

  const result: IDraftEvaluationResult = {
    objectiveEvaluation: objectiveEvaluation,
    llmEvaluation: llmEvaluation,
    writingStyleEvaluation: writingStyleEvaluation,
  };

  return result;
}
