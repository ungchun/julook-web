import { describe, it, expect } from "vitest";
import type { Makgeolli } from "@/shared/types";
import { applySort, type SortOption } from "./sort";

function make(overrides: Partial<Makgeolli>): Makgeolli {
  return {
    id: "x",
    name: "x",
    brewery: null,
    website: null,
    awards: null,
    sweetness: null,
    sourness: null,
    thickness: null,
    carbonation: null,
    has_sweetener: null,
    ingredients: null,
    alcohol_percentage: null,
    image_name: null,
    created_at: null,
    updated_at: null,
    ...overrides,
  };
}

describe("applySort", () => {
  it("recommended: created_at DESC (최신 먼저)", () => {
    const a = make({ id: "a", created_at: "2025-01-01" });
    const b = make({ id: "b", created_at: "2025-12-31" });
    const c = make({ id: "c", created_at: "2025-06-15" });

    const sorted = applySort([a, b, c], "recommended");

    expect(sorted.map((m) => m.id)).toEqual(["b", "c", "a"]);
  });

  it("recommended: created_at 둘 다 null이면 id 문자열 내림차순 fallback", () => {
    const a = make({ id: "a-zzz", created_at: null });
    const b = make({ id: "b-aaa", created_at: null });

    const sorted = applySort([a, b], "recommended");

    // "b-aaa" > "a-zzz" 문자열 비교 → b 먼저
    expect(sorted.map((m) => m.id)).toEqual(["b-aaa", "a-zzz"]);
  });

  it("highAlcohol: alcohol DESC (높은 도수 먼저)", () => {
    const a = make({ id: "a", alcohol_percentage: 6 });
    const b = make({ id: "b", alcohol_percentage: 14 });
    const c = make({ id: "c", alcohol_percentage: 10 });

    const sorted = applySort([a, b, c], "highAlcohol");

    expect(sorted.map((m) => m.id)).toEqual(["b", "c", "a"]);
  });

  it("highAlcohol: null은 0으로 취급되어 맨 뒤", () => {
    const a = make({ id: "a", alcohol_percentage: null });
    const b = make({ id: "b", alcohol_percentage: 10 });

    const sorted = applySort([a, b], "highAlcohol");

    expect(sorted.map((m) => m.id)).toEqual(["b", "a"]);
  });

  it("lowAlcohol: alcohol ASC (낮은 도수 먼저)", () => {
    const a = make({ id: "a", alcohol_percentage: 6 });
    const b = make({ id: "b", alcohol_percentage: 14 });
    const c = make({ id: "c", alcohol_percentage: 10 });

    const sorted = applySort([a, b, c], "lowAlcohol");

    expect(sorted.map((m) => m.id)).toEqual(["a", "c", "b"]);
  });

  it("lowAlcohol: null은 0으로 취급되어 맨 앞", () => {
    const a = make({ id: "a", alcohol_percentage: null });
    const b = make({ id: "b", alcohol_percentage: 5 });

    const sorted = applySort([a, b], "lowAlcohol");

    expect(sorted.map((m) => m.id)).toEqual(["a", "b"]);
  });

  it("원본 배열은 변경하지 않는다 (pure function)", () => {
    const a = make({ id: "a", alcohol_percentage: 5 });
    const b = make({ id: "b", alcohol_percentage: 15 });
    const original = [a, b];

    applySort(original, "highAlcohol");

    expect(original.map((m) => m.id)).toEqual(["a", "b"]);
  });

  it("SortOption type union — 3가지만 허용", () => {
    const opts: SortOption[] = ["recommended", "highAlcohol", "lowAlcohol"];
    expect(opts).toHaveLength(3);
  });
});
