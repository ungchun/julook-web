import { describe, it, expect } from "vitest";
import { FILTER_META, getFilterMeta } from "./types";

describe("FILTER_META / getFilterMeta", () => {
  it("getFilterMeta('thick') returns thickness gte 3 mapping", () => {
    const meta = getFilterMeta("thick");
    expect(meta).toBeDefined();
    expect(meta?.slug).toBe("thick");
    expect(meta?.label).toBe("걸쭉한");
    expect(meta?.column).toBe("thickness");
    expect(meta?.predicate).toEqual({ op: "gte", value: 3 });
  });

  it("getFilterMeta('sweet') returns sweetness gte 3 mapping", () => {
    const meta = getFilterMeta("sweet");
    expect(meta?.column).toBe("sweetness");
    expect(meta?.predicate).toEqual({ op: "gte", value: 3 });
    expect(meta?.label).toBe("달달한");
  });

  it("getFilterMeta('sour') returns sourness gte 3 mapping", () => {
    const meta = getFilterMeta("sour");
    expect(meta?.column).toBe("sourness");
    expect(meta?.predicate).toEqual({ op: "gte", value: 3 });
  });

  it("getFilterMeta('carbonated') returns carbonation gte 3 mapping", () => {
    const meta = getFilterMeta("carbonated");
    expect(meta?.column).toBe("carbonation");
    expect(meta?.predicate).toEqual({ op: "gte", value: 3 });
  });

  it("getFilterMeta('no-sweetener') returns has_sweetener eq false mapping", () => {
    const meta = getFilterMeta("no-sweetener");
    expect(meta?.column).toBe("has_sweetener");
    expect(meta?.predicate).toEqual({ op: "eq", value: false });
    expect(meta?.label).toBe("감미료 없는");
  });

  it("getFilterMeta('unknown') returns undefined", () => {
    expect(getFilterMeta("unknown")).toBeUndefined();
    expect(getFilterMeta("")).toBeUndefined();
    expect(getFilterMeta("noSweetener")).toBeUndefined();
  });

  it("FILTER_META covers all 5 iOS FilterType slugs", () => {
    const slugs = Object.keys(FILTER_META).sort();
    expect(slugs).toEqual(
      ["carbonated", "no-sweetener", "sour", "sweet", "thick"].sort(),
    );
  });
});
