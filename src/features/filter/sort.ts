import type { Makgeolli } from "@/shared/types";

// iOS FilterCore+Effects.swift::applySort 미러.
// 클라이언트 측 정렬 — 서버 변경 0건.
export type SortOption = "recommended" | "highAlcohol" | "lowAlcohol";

export function applySort(
  items: Makgeolli[],
  sort: SortOption,
): Makgeolli[] {
  const copy = [...items];
  switch (sort) {
    case "recommended":
      copy.sort((a, b) => {
        if (a.created_at != null && b.created_at != null) {
          return a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0;
        }
        // 둘 다 null → id 문자열 내림차순 (본앱: a.id.uuidString > b.id.uuidString → true)
        if (a.created_at == null && b.created_at == null) {
          return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
        }
        // 한쪽만 null → null 뒤로
        return a.created_at == null ? 1 : -1;
      });
      return copy;
    case "highAlcohol":
      copy.sort((a, b) => (b.alcohol_percentage ?? 0) - (a.alcohol_percentage ?? 0));
      return copy;
    case "lowAlcohol":
      copy.sort((a, b) => (a.alcohol_percentage ?? 0) - (b.alcohol_percentage ?? 0));
      return copy;
  }
}
