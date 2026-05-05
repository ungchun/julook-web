// iOS FilterType (Projects/Core/Sources/Model/FilterTypes.swift) +
// fetchFilteredMakgeollis (SupabaseClientLive+Makgeolli.swift:55-82) 미러.
// URL slug 는 kebab-case (Web 관습) — iOS noSweetener → web "no-sweetener".

export type FilterSlug =
  | "thick"
  | "sweet"
  | "sour"
  | "carbonated"
  | "no-sweetener";

export type FilterPredicate =
  | { op: "gte"; value: 3 }
  | { op: "eq"; value: false };

export type FilterMeta = {
  slug: FilterSlug;
  label: string;
  icon: string;
  column: "thickness" | "sweetness" | "sourness" | "carbonation" | "has_sweetener";
  predicate: FilterPredicate;
};

export const FILTER_META: Record<FilterSlug, FilterMeta> = {
  thick: {
    slug: "thick",
    label: "걸쭉한",
    icon: "/assets/filter/thick.svg",
    column: "thickness",
    predicate: { op: "gte", value: 3 },
  },
  sweet: {
    slug: "sweet",
    label: "달달한",
    icon: "/assets/filter/sweet.svg",
    column: "sweetness",
    predicate: { op: "gte", value: 3 },
  },
  sour: {
    slug: "sour",
    label: "시큼한",
    icon: "/assets/filter/sour.svg",
    column: "sourness",
    predicate: { op: "gte", value: 3 },
  },
  carbonated: {
    slug: "carbonated",
    label: "탄산감 많은",
    icon: "/assets/filter/carbonated.svg",
    column: "carbonation",
    predicate: { op: "gte", value: 3 },
  },
  "no-sweetener": {
    slug: "no-sweetener",
    label: "감미료 없는",
    icon: "/assets/filter/no-sweetener.svg",
    column: "has_sweetener",
    predicate: { op: "eq", value: false },
  },
};

export function getFilterMeta(slug: string): FilterMeta | undefined {
  return (FILTER_META as Record<string, FilterMeta | undefined>)[slug];
}
