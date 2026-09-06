import getSupabaseClient from "./getSupabaseClient";
import isAccountActive from "./isAccountActive";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function makeFileName(prefix: string, extension: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
}

export async function uploadHeadshotToSupabase(
  imageBuffer: Buffer,
  options: {
    userId: string;
    contentType?: string;
  },
): Promise<string | null> {
  const supabase = getSupabaseClient();
  const bucket =
    process.env.SUPABASE_HEADSHOT_BUCKET ?? "professional_headshots";

  const userId = options.userId;
  if (!UUID_PATTERN.test(userId)) {
    throw new Error("Invalid user ID for headshot upload");
  }

  const contentType = options.contentType ?? "image/jpeg";

  const fileName = makeFileName("headshot", "jpg");
  const objectPath = `generated/${userId}/${fileName}`;

  if (!await isAccountActive(userId)) {
    throw new Error("Account is not available for headshot upload");
  }

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

  try {
    if (!await isAccountActive(userId)) {
      throw new Error("Account is not available for headshot upload");
    }
  } catch (accountStatusError) {
    const { error: cleanupError } = await supabase.storage
      .from(bucket)
      .remove([objectPath]);

    if (cleanupError) {
      console.error("Unable to roll back headshot upload:", cleanupError);
    }
    throw accountStatusError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return data?.publicUrl ?? null;
}
