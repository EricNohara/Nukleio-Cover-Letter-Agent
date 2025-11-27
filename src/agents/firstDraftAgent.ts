import OpenAI from "openai";
import { WritingAnalysis } from "../utils/writing/writingSchema";
import { ITheirStackJob } from "../interfaces/ITheirStackResponse";
import { IUserInfo } from "../interfaces/IUserInfoResponse";

function generatePrompt(
  userData: IUserInfo,
  jobData: ITheirStackJob,
  writingAnalysis: WritingAnalysis | null
) {}

export default function firstDraftAgent(
  userData: IUserInfo,
  jobData: ITheirStackJob,
  writingAnalysis: WritingAnalysis | null
) {}
