import { WritingAnalysis } from "../utils/writing/writingSchema";
import { IJobInfo } from "./IJobInfo";

export interface ICoverLetterSession {
  jobData: IJobInfo;
  writingAnalysis: WritingAnalysis | null;
  writingSample: string | null;
  currentDraft: string;
}
