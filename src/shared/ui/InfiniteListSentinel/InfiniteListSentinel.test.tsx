import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { InfiniteListSentinel } from "./InfiniteListSentinel";

type Callback = (entries: { isIntersecting: boolean }[]) => void;

let registeredCallback: Callback | null = null;
const observeMock = vi.fn();
const disconnectMock = vi.fn();

class MockIntersectionObserver {
  constructor(cb: Callback) {
    registeredCallback = cb;
  }
  observe(...args: unknown[]) {
    observeMock(...args);
  }
  disconnect() {
    disconnectMock();
  }
  unobserve() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  registeredCallback = null;
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("InfiniteListSentinel", () => {
  it("on mount, observes the sentinel element", () => {
    render(<InfiniteListSentinel onIntersect={vi.fn()} />);
    expect(observeMock).toHaveBeenCalledTimes(1);
  });

  it("when intersection fires with isIntersecting=true, calls onIntersect", () => {
    const onIntersect = vi.fn();
    render(<InfiniteListSentinel onIntersect={onIntersect} />);

    registeredCallback?.([{ isIntersecting: true }]);
    expect(onIntersect).toHaveBeenCalledTimes(1);
  });

  it("when intersection fires with isIntersecting=false, does NOT call onIntersect", () => {
    const onIntersect = vi.fn();
    render(<InfiniteListSentinel onIntersect={onIntersect} />);

    registeredCallback?.([{ isIntersecting: false }]);
    expect(onIntersect).not.toHaveBeenCalled();
  });

  it("on unmount, disconnects the observer", () => {
    const { unmount } = render(
      <InfiniteListSentinel onIntersect={vi.fn()} />,
    );
    unmount();
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });
});
