import { WritingAnalysis } from "../types/writingAnalysis";
import { IJobInfo } from "./IJobInfo";

export interface ICoverLetterSession {
  jobData: IJobInfo;
  writingAnalysis: WritingAnalysis | null;
  writingSample: string | null;
  currentDraft: string;
}
