import OpenAI from "openai";
import { IUserInfo } from "../interfaces/IUserInfoResponse";
import { objectiveEvaluator } from "../utils/eval/objectiveEvaluator";
import { WritingAnalysis } from "../utils/writing/writingSchema";
import { IObjectiveEvaluationResult } from "../interfaces/IEvaluator";
import { ITheirStackJob } from "../interfaces/ITheirStackResponse";

export default async function draftEvaluatorAgent(
  clientOpenAI: OpenAI,
  draft: string,
  userData: IUserInfo,
  jobData: ITheirStackJob,
  writingAnalysis: WritingAnalysis | null
) {
  const objectiveEvaluation: IObjectiveEvaluationResult =
    await objectiveEvaluator(draft, userData, jobData);
}
