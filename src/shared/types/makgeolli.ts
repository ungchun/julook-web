// iOS 본앱 Makgeolli.swift (Projects/Core/Sources/Model/) 의 미러.
// 필드명은 Supabase 컬럼 그대로(snake_case) — 변환 없이 .from('makgeolli').select() 결과를 받는다.
// Date 컬럼은 Supabase JS가 ISO 8601 문자열로 반환하므로 string으로 둔다.

export type Makgeolli = {
  id: string;
  name: string;
  brewery: string | null;
  website: string | null;
  awards: string[] | null;
  sweetness: number | null;
  sourness: number | null;
  thickness: number | null;
  carbonation: number | null;
  has_sweetener: boolean | null;
  ingredients: string[] | null;
  alcohol_percentage: number | null;
  image_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};
