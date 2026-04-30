import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli } from "@/shared/types";

// Supabase Storage 버킷명 (DB의 image_name 컬럼은 확장자 없이 저장 가능 → 이쪽에서 보정).
const MAKGEOLLI_IMAGE_BUCKET = "makgeolli_image";
const IMAGE_EXTENSION = ".png";
const NEW_RELEASES_LIMIT = 5;

export async function fetchNewReleases(): Promise<Makgeolli[]> {
  const { data, error } = await supabase
    .from("makgeolli")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(NEW_RELEASES_LIMIT);

  if (error) throw error;
  if (!data) throw new Error("Failed to fetch new releases: empty response");

  return data as Makgeolli[];
}

export function getMakgeolliImageUrl(imageName: string | null): string | null {
  if (!imageName) return null;

  const withExtension = imageName.endsWith(IMAGE_EXTENSION)
    ? imageName
    : `${imageName}${IMAGE_EXTENSION}`;

  return supabase.storage
    .from(MAKGEOLLI_IMAGE_BUCKET)
    .getPublicUrl(withExtension).data.publicUrl;
}
