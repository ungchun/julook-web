// iOS UserComment.swift 미러. Supabase 컬럼 snake_case 유지.

export type UserComment = {
  id: string;
  user_id: string;
  makgeolli_id: string;
  comment: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};
