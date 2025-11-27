import OpenAI from "openai";
import { IUserInfo } from "../interfaces/IUserInfoResponse";
import { objectiveEvaluator } from "../utils/eval/objectiveEvaluator";
import { WritingAnalysis } from "../utils/writing/writingSchema";
import {
  IDraftEvaluationResult,
  ILlmEvaluationResult,
  IObjectiveEvaluationResult,
} from "../interfaces/IEvaluator";
import { ITheirStackJob } from "../interfaces/ITheirStackResponse";
import llmEvaluator from "../utils/eval/llmEvaluator";

export default async function draftEvaluatorAgent(
  clientOpenAI: OpenAI,
  conversationId: string,
  draft: string,
  userData: IUserInfo,
  jobData: ITheirStackJob,
  writingAnalysis: WritingAnalysis | null
): Promise<IDraftEvaluationResult> {
  const objectiveEvaluation: IObjectiveEvaluationResult =
    await objectiveEvaluator(draft, userData, jobData);

  const llmEvaluation: ILlmEvaluationResult = await llmEvaluator(
    clientOpenAI,
    conversationId,
    draft
  );

  const result: IDraftEvaluationResult = {
    objectiveEvaluation: objectiveEvaluation,
    llmEvaluation: llmEvaluation,
  };

  return result;
}
