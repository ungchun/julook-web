import { supabase } from "./supabase";

// Supabase Storage 버킷명. DB의 image_name 컬럼은 확장자 없이 저장 가능 → 이쪽에서 보정.
// list/detail 양쪽에서 쓰이므로 feature 폴더 밖, shared/lib에 둔다.
const MAKGEOLLI_IMAGE_BUCKET = "makgeolli_image";
const IMAGE_EXTENSION = ".png";

export function getMakgeolliImageUrl(imageName: string | null): string | null {
  if (!imageName) return null;

  const withExtension = imageName.endsWith(IMAGE_EXTENSION)
    ? imageName
    : `${imageName}${IMAGE_EXTENSION}`;

  return supabase.storage
    .from(MAKGEOLLI_IMAGE_BUCKET)
    .getPublicUrl(withExtension).data.publicUrl;
}
