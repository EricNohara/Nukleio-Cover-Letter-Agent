import getSupabaseClient from "./getSupabaseClient";

function makeFileName(prefix: string, extension: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
}

export async function uploadResumeToSupabase(
  pdfBuffer: Buffer,
  options?: {
    prefix?: string;
    contentType?: string;
    fileNamePrefix?: string;
  },
): Promise<string | null> {
  const supabase = getSupabaseClient();
  const bucket = process.env.SUPABASE_RESUME_BUCKET ?? "generated_resumes";

  const prefix = options?.prefix ?? "generated";
  const contentType = options?.contentType ?? "application/pdf";
  const fileNamePrefix = options?.fileNamePrefix ?? "resume";

  const fileName = makeFileName(fileNamePrefix, "pdf");
  const objectPath = `${prefix}/${fileName}`;

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

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return data?.publicUrl ?? null;
}
