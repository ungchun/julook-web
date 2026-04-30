// iOS Award.swift 미러. Supabase 컬럼 snake_case 유지.

export type Award = {
  id: string;
  name: string;
  name_en: string | null;
  year: number;
  type: string;
};
