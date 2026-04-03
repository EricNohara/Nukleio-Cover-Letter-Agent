import { ICoverLetterSession } from "../../interfaces/ICoverLetterSession";
import { IJobInfo } from "../../interfaces/IJobInfo";
import { WritingAnalysis } from "../writing/writingSchema";
import getSupabaseClient from "./getSupabaseClient";

export async function getCoverLetterSession(
  userId: string,
  sessionId: string,
): Promise<ICoverLetterSession> {
  const supabase = getSupabaseClient();

  //   retrieve session from supabase
  const { data, error } = await supabase
    .from("cover_letter_sessions")
    .select("job_data, writing_analysis, writing_sample, current_draft")
    .eq("user_id", userId)
    .eq("id", sessionId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch cover letter session: ${error.message}`);
  }

  if (!data) {
    throw new Error("Cover letter session not found");
  }

  return {
    jobData: data.job_data as IJobInfo,
    writingAnalysis: data.writing_analysis as WritingAnalysis | null,
    writingSample: data.writing_sample,
    currentDraft: data.current_draft,
  };
}
