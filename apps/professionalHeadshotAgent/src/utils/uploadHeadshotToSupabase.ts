import getSupabaseClient from "./getSupabaseClient";

function makeFileName(prefix: string, extension: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
}

export async function uploadHeadshotToSupabase(
  imageBuffer: Buffer,
  options?: {
    prefix?: string;
    contentType?: string;
  },
): Promise<string | null> {
  const supabase = getSupabaseClient();
  const bucket =
    process.env.SUPABASE_HEADSHOT_BUCKET ?? "professional_headshots";

  const prefix = options?.prefix ?? "generated";
  const contentType = options?.contentType ?? "image/jpeg";

  const fileName = makeFileName("headshot", "jpg");
  const objectPath = `${prefix}/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, imageBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return data?.publicUrl ?? null;
}
