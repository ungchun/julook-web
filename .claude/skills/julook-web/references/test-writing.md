---
name: test-writing
description: Vitest + React Testing Library 기반 테스트 작성 스킬. 실패 테스트(RED) 작성, 컴포넌트/훅/API 함수 검증, vi.mock 의존성 치환, 가짜 타이머 사용을 다룬다. julook-web에서 테스트 작업 시 반드시 사용할 것.
---

# Test Writing (Web)

julook-web의 모든 동작은 Vitest + React Testing Library로 검증한다. 이 스킬은 실패 테스트(Phase 1 RED) 작성과 RTL 사용법을 담는다.

## 언제 이 스킬을 사용하는가

- TDD Phase 1 (RED) — 프로덕션 코드 건드리기 전 실패 테스트 쓸 때
- Component 렌더/상호작용 검증
- Hook 단위 테스트 (`renderHook`)
- API 함수 단위 테스트 (`vi.mock("@/shared/lib/supabase")`)
- 비동기 Effect 타이밍 제어 (`vi.useFakeTimers()`)
- 기존 코드에 테스트 소급 추가

## 핵심 원칙 (왜 그런지 포함)

### 1. 프로덕션 코드 건드리기 전에 먼저 쓴다

Phase 1의 정의. `src/**/*.{ts,tsx}` (테스트 제외)를 수정하기 **전에** `*.test.{ts,tsx}`에 실패 테스트를 커밋 가능한 상태로 만든다.

**왜**: 실패하는 것을 눈으로 본 테스트만이 "무언가 잡는다"는 근거를 가진다.

### 2. 처음부터 통과하는 테스트는 잘못된 테스트다

```ts
// BAD — 항상 통과
it("array is empty by default", () => {
  expect([].length).toBe(0); // 의미 없음
});
```

**왜**: 이런 테스트는 프로덕션 코드가 잘못돼도 실패하지 않는다. 재작성해서 실제 의도를 검증.

### 3. 외부 IO는 모킹

```ts
import { vi } from "vitest";

vi.mock("@/shared/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: mockMakgeolli, error: null }),
      })),
    })),
  },
}));
```

**왜**: 실제 supabase를 부르면 테스트가 느리고 네트워크 의존. 오프라인에서 실패.

### 4. Hook 테스트는 `renderHook`

```ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMakgeolliList } from "./useMakgeolliList";

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

it("returns makgeolli list when sorted by latest", async () => {
  const { result } = renderHook(() => useMakgeolliList({ sort: "latest" }), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual(mockMakgeolli);
});
```

### 5. Component 테스트는 사용자 시나리오

```ts
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

it("calls onTap when card is clicked", async () => {
  const onTap = vi.fn();
  render(<MakgeolliCard makgeolli={mockMakgeolli} onTap={onTap} />);
  await userEvent.click(screen.getByRole("button", { name: mockMakgeolli.name }));
  expect(onTap).toHaveBeenCalledOnce();
});
```

**왜**: getByText/getByRole 같은 사용자 관점 쿼리는 구현 변경에 강함. testid 남용은 결합 증가.

### 6. 실패 경로도 테스트한다

```ts
it("returns error when supabase throws", async () => {
  vi.mocked(supabase.from).mockImplementation(() => {
    throw new Error("Network error");
  });
  const { result } = renderHook(() => useMakgeolliList(), { wrapper });
  await waitFor(() => expect(result.current.isError).toBe(true));
});
```

**왜**: 해피 패스만 쓰면 에러 처리 로직이 검증되지 않는다. 사용자가 겪는 경로의 절반은 실패.

## 테스트 파일 위치

- 코로케이트: `Component.tsx` 옆에 `Component.test.tsx`
- 페이지/통합 테스트: `*.test.tsx` 같은 폴더
- 테스트 픽스처/유틸: `src/test/`

## 메서드 네이밍

`it("when X, should Y")` 또는 `it("X 하면 Y 한다")` (한국어 OK).

```ts
describe("useMakgeolliList", () => {
  it("when sort is latest, orders by created_at desc", () => { ... });
  it("when supabase fails, surfaces error", () => { ... });
});
```

**왜**: 실패 로그에 의도가 그대로 드러난다.

## 가짜 타이머

```ts
import { vi } from "vitest";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("triggers debounced search after 300ms", async () => {
  const { result } = renderHook(() => useDebouncedSearch());
  result.current.setQuery("막걸리");
  vi.advanceTimersByTime(300);
  expect(result.current.debouncedQuery).toBe("막걸리");
});
```

**왜**: 실제 setTimeout을 쓰면 테스트가 300ms 기다린다 → N개 테스트에서 N×300ms 낭비 + 타이밍 불안정.

## 새 feature/페이지에 테스트 환경 신설

스캐폴딩에 이미 `vitest.config` + `src/test/setup.ts`가 있어 추가 설정 불필요. 신설 폴더의 첫 테스트는 **실패 테스트 그 자체**로 작성 (placeholder 금지).

## 실패 확인 방법

```bash
npm test                              # 전체
npm test -- src/path/to/file.test.ts  # 단일 파일
npm test -- --run                     # 1회 실행 (default)
```

실패 로그에 **새 테스트 이름**과 **예상값/실제값 diff**가 드러나야 Phase 1 완료.

## 안티패턴

| BAD | 왜 나쁜가 |
|-----|-----------|
| `expect(true).toBe(true)` | 무의미한 placeholder — 실제 검증 0 |
| 컴포넌트 internal state 직접 검사 | 구현 디테일에 결합. 사용자 관점 쿼리 사용 |
| 실제 supabase 호출 | 느리고 불안정. mock 필수 |
| `await new Promise(r => setTimeout(r, 1000))` | `vi.useFakeTimers()` 사용 |
| `data-testid` 남용 | 시멘틱 쿼리 우선 (`getByRole`, `getByLabelText`) |
| 한 테스트가 여러 시나리오 검증 | 분리. 실패 시 원인 추적 어려움 |

## Apps in Toss SDK 모킹

```ts
vi.mock("@/shared/lib/toss", () => ({
  toss: {
    requestReview: vi.fn().mockResolvedValue(undefined),
  },
}));
```

직접 `@apps-in-toss/web-framework` 모킹 금지 — wrapper(`@/shared/lib/toss`) 단일 지점만.

## 참조 (프로젝트 문서)

- 테스트 작성법: `docs/testing/writing.md`
- 데이터 흐름: `docs/architecture/data-flow.md`
- 코딩 스타일: `docs/coding/style.md`
