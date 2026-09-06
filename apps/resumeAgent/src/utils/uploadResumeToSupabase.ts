import getSupabaseClient from "./getSupabaseClient";
import isAccountActive from "./isAccountActive";

function makeFileName(prefix: string, extension: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
}

export async function uploadResumeToSupabase(
  pdfBuffer: Buffer,
  options: {
    userId: string;
    contentType?: string;
    fileNamePrefix?: string;
  },
): Promise<string | null> {
  const supabase = getSupabaseClient();
  const bucket = process.env.SUPABASE_RESUME_BUCKET ?? "generated_resumes";

  const userId = options.userId;
  const contentType = options.contentType ?? "application/pdf";
  const fileNamePrefix = options.fileNamePrefix ?? "resume";

  const fileName = makeFileName(fileNamePrefix, "pdf");
  const objectPath = `${userId}/${fileName}`;

  if (!await isAccountActive(userId)) {
    throw new Error("Account is not available for resume upload");
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, pdfBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error("Supabase resume upload error:", error);
    return null;
  }

  try {
    if (!await isAccountActive(userId)) {
      throw new Error("Account is not available for resume upload");
    }
  } catch (accountStatusError) {
    const { error: cleanupError } = await supabase.storage
      .from(bucket)
      .remove([objectPath]);

    if (cleanupError) {
      console.error("Unable to roll back resume upload:", cleanupError);
    }
    throw accountStatusError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return data?.publicUrl ?? null;
}
