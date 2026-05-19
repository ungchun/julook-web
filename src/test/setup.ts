import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom 환경에는 IntersectionObserver 가 없으므로 no-op stub 제공.
// InfiniteListSentinel.test.tsx 는 자체적으로 vi.stubGlobal 로 덮어써서 동작 검증.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class NoopIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.IntersectionObserver = NoopIntersectionObserver as any;
}

afterEach(() => {
  cleanup();
});
