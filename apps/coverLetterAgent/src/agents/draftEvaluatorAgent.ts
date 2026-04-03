import OpenAI from "openai";
import { IUserInfo } from "../interfaces/IUserInfoResponse";
import { objectiveEvaluator } from "../utils/eval/objectiveEvaluator";
import { WritingAnalysis } from "../utils/writing/writingSchema";
import {
  IDraftEvaluationResult,
  ILlmEvaluationResult,
  IObjectiveEvaluationResult,
  IWritingStyleEvaluationResult,
} from "../interfaces/IEvaluator";
import llmEvaluator from "../utils/eval/llmEvaluator";
import writingStyleEvaluator from "../utils/eval/writingStyleEvaluator";
import { IJobInfo } from "../interfaces/IJobInfo";

export default async function draftEvaluatorAgent(
  clientOpenAI: OpenAI,
  conversationId: string,
  draft: string,
  userData: IUserInfo,
  jobData: IJobInfo,
  writingAnalysis: WritingAnalysis | null,
): Promise<IDraftEvaluationResult> {
  const objectiveEvaluation: IObjectiveEvaluationResult =
    await objectiveEvaluator(draft, userData, jobData);

  const llmEvaluation: ILlmEvaluationResult = await llmEvaluator(
    clientOpenAI,
    conversationId,
    writingAnalysis,
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
