import type { ReactNode } from "react";
import { render, type RenderResult } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

// 라우터 + QueryClient 통합 테스트 헬퍼.
// MemoryRouter로 URL 파라미터를 주입할 수 있고, QueryClient는 retry: false로 빠른 실패를 보장.
// production 코드 아님 — 테스트 인프라.
type RenderOptions = {
  /**
   * MemoryRouter `initialEntries[0]`. 기본값 "/".
   */
  route?: string;
  /**
   * 외부에서 주입하는 QueryClient. 미지정 시 retry: false 기본값.
   */
  queryClient?: QueryClient;
};

export function renderWithProviders(
  ui: ReactNode,
  options: RenderOptions = {},
): RenderResult {
  const { route = "/", queryClient } = options;

  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}
