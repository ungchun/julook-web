import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePaginatedList } from "./use-paginated-list";

function makeItems(n: number) {
  return Array.from({ length: n }, (_, i) => `i_${i + 1}`);
}

describe("usePaginatedList", () => {
  it("initially exposes first pageSize items", () => {
    const items = makeItems(50);
    const { result } = renderHook(() => usePaginatedList(items, 20));
    expect(result.current.displayed).toHaveLength(20);
    expect(result.current.displayed[0]).toBe("i_1");
    expect(result.current.hasMore).toBe(true);
  });

  it("loadMore appends the next pageSize chunk", () => {
    const items = makeItems(50);
    const { result } = renderHook(() => usePaginatedList(items, 20));

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.displayed).toHaveLength(40);
    expect(result.current.hasMore).toBe(true);

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.displayed).toHaveLength(50);
    expect(result.current.hasMore).toBe(false);
  });

  it("when items prop changes, resets displayed to first page", () => {
    const initial = makeItems(50);
    const { result, rerender } = renderHook(
      ({ data }: { data: string[] }) => usePaginatedList(data, 20),
      { initialProps: { data: initial } },
    );

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.displayed).toHaveLength(40);

    const next = makeItems(30).map((s) => `${s}_new`);
    rerender({ data: next });
    expect(result.current.displayed).toHaveLength(20);
    expect(result.current.displayed[0]).toBe("i_1_new");
  });

  it("when items is empty, displayed is empty and hasMore is false", () => {
    const { result } = renderHook(() => usePaginatedList<string>([], 20));
    expect(result.current.displayed).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });

  it("when items fewer than pageSize, hasMore is false from the start", () => {
    const items = makeItems(5);
    const { result } = renderHook(() => usePaginatedList(items, 20));
    expect(result.current.displayed).toHaveLength(5);
    expect(result.current.hasMore).toBe(false);
  });

  it("calling loadMore when hasMore is false is a no-op", () => {
    const items = makeItems(5);
    const { result } = renderHook(() => usePaginatedList(items, 20));

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.displayed).toHaveLength(5);
  });
});
