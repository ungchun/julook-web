---
name: feature-design
description: React Hook + Component + API 함수 설계 스킬. 새 feature 폴더 작성, Hook 추가, API 함수 정의, Apps in Toss SDK 연동, React Query 사용 등 julook-web의 모든 feature 설계 작업에 반드시 사용할 것.
---

# Feature Design (Web)

julook-web의 모든 feature는 **Hook + Component + API 함수** 패턴을 따른다. iOS의 TCA Reducer 자리를 React Hook이 채운다.

## 언제 이 스킬을 사용하는가

- 신규 feature 폴더 작성
- 기존 feature에 Hook/Action 추가
- 비동기 effect (Supabase 호출 등) 정의
- 페이지(`pages/`) 신설
- 외부 의존성(`@/shared/lib/...`) 식별 및 사용
- 도메인 타입 추가 (`@/shared/types/`)

## Feature 폴더 구조

```
src/features/{feature-name}/
├── api/
│   ├── fetchMakgeolliList.ts      # Supabase 호출 함수 (pure async)
│   └── fetchMakgeolliList.test.ts
├── hooks/
│   ├── useMakgeolliList.ts        # React Query 또는 useState 래핑
│   └── useMakgeolliList.test.ts
├── components/
│   ├── MakgeolliCard.tsx          # 표현 컴포넌트
│   ├── MakgeolliCard.test.tsx
│   └── index.ts                   # 배럴
└── index.ts                       # 외부 노출 인터페이스
```

각 레이어 책임:
- **api/**: pure async 함수. 입력 → supabase 호출 → 출력. UI 모름.
- **hooks/**: 서버 상태(React Query) 또는 클라이언트 상태(useState/useReducer). 컴포넌트에 데이터·콜백 제공.
- **components/**: props만 받아 렌더. 비즈니스 로직 금지.

## Page 구조

```
src/pages/{PageName}/
├── {PageName}.tsx                  # 라우트 진입점
├── {PageName}.test.tsx
└── index.ts
```

페이지는 feature(들)을 조립한다. 비즈니스 로직은 feature 안에 있어야 함.

## Hook 기본 형태

```ts
// src/features/makgeolli-list/hooks/useMakgeolliList.ts
import { useQuery } from "@tanstack/react-query";
import { fetchMakgeolliList } from "../api/fetchMakgeolliList";

export interface UseMakgeolliListOptions {
  sort?: "latest" | "name" | "rating";
}

export function useMakgeolliList(options: UseMakgeolliListOptions = {}) {
  const { sort = "latest" } = options;
  return useQuery({
    queryKey: ["makgeolli-list", sort],
    queryFn: () => fetchMakgeolliList({ sort }),
  });
}
```

## API 함수 기본 형태

```ts
// src/features/makgeolli-list/api/fetchMakgeolliList.ts
import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli } from "@/shared/types/makgeolli";

export interface FetchMakgeolliListInput {
  sort: "latest" | "name" | "rating";
}

export async function fetchMakgeolliList(
  input: FetchMakgeolliListInput,
): Promise<Makgeolli[]> {
  const { data, error } = await supabase
    .from("makgeolli")
    .select("*")
    .order(sortColumn(input.sort), { ascending: input.sort === "name" });

  if (error) throw error;
  return data ?? [];
}

function sortColumn(sort: FetchMakgeolliListInput["sort"]): string {
  switch (sort) {
    case "latest": return "created_at";
    case "name": return "name";
    case "rating": return "rating";
  }
}
```

## 핵심 규칙 (왜 그런지 포함)

### 1. State는 두 부류

- **서버 상태**: React Query로 (캐시, 재요청, stale 관리 위임)
- **클라이언트 상태**: `useState`/`useReducer`/Zustand
- **URL 상태**: 라우터 search params

**왜**: 섞으면 "이 상태가 어디에 있는가" 불명확. 같은 데이터를 두 곳에서 관리하면 동기화 버그 발생.

### 2. 외부 IO는 wrapper 모듈에서만 import

```ts
// GOOD
import { supabase } from "@/shared/lib/supabase";

// BAD
import { createClient } from "@supabase/supabase-js"; // ❌ 직접 import
```

**왜**: 테스트에서 `vi.mock("@/shared/lib/supabase")` 하나로 차단 가능. SDK 변경 시 영향 단일 지점.

### 3. Component는 비즈니스 로직 0

```tsx
// GOOD
function MakgeolliCard({ makgeolli, onTap }: Props) {
  return <button onClick={onTap}>{makgeolli.name}</button>;
}

// BAD — 직접 Supabase 호출
function MakgeolliCard({ id }: { id: number }) {
  useEffect(() => {
    supabase.from("makgeolli").select(); // ❌
  }, []);
}
```

**왜**: Component가 IO를 알면 단위 테스트가 통합 테스트가 된다. 또 같은 데이터를 여러 컴포넌트가 따로 페치하는 중복 발생.

### 4. 도메인 타입은 iOS 본앱 미러

```ts
// src/shared/types/makgeolli.ts
export interface Makgeolli {
  id: number;
  name: string;
  name_en: string | null;
  alcohol: number;
  // ...
}
```

iOS의 `Projects/Domain/Sources/Models/Makgeolli.swift` 와 동일 필드, snake_case 유지.

**왜**: Web에서 임의로 정의하면 백엔드(Supabase)가 한쪽만 따른다. 일관성 깨지면 데이터 표시 버그.

### 5. Hook 이름은 `use` + 동사/명사

| GOOD | BAD | 이유 |
|------|-----|------|
| `useMakgeolliList()` | `useGetMakgeolli()` | "Get"은 IO 동사. Hook은 데이터 자체를 노출 |
| `useToggleFavorite()` | `useFavorite()` | 액션이면 동사로 |
| `useSearchFilter()` | `useSearchState()` | "State"는 무의미한 추가 |

### 6. Apps in Toss SDK 호출은 lazy import

```ts
// src/shared/lib/toss.ts
export const toss = {
  requestReview: async () => {
    const { requestReview } = await import("@apps-in-toss/web-framework");
    return requestReview();
  },
};
```

**왜**: SDK 번들이 크면 초기 로딩 늦어짐. 사용 시점에만 import. 또 SSR/테스트 환경에서 SDK 누락 회피.

## 새 페이지 추가 체크리스트

1. `src/pages/{PageName}/{PageName}.tsx` — 페이지 컴포넌트
2. `src/pages/{PageName}/{PageName}.test.tsx` — 페이지 테스트
3. `src/pages/{PageName}/index.ts` — 배럴 export
4. `src/app/App.tsx` — `<Route path="..." element={<PageName />} />` 추가
5. (필요 시) `src/features/{feature-name}/` 신설

## Hook 이름 안티패턴

| BAD | GOOD | 이유 |
|-----|------|------|
| `useFetch{X}` | `use{X}` | "Fetch"는 구현 디테일 |
| `useState{X}` | `use{X}State` 만일 진짜 상태만 | 보통 다른 이름이 더 적절 |
| `use{X}Manager` | `use{X}` | "Manager"는 모호 |

## 타입 Equatable / 직렬화

- 모든 도메인 모델은 `interface` 또는 `type` (struct 아님)
- React Query 캐시 키는 단순 직렬화 가능한 값만 (객체 OK, 함수 X)
- 컴포넌트 props는 `Equatable` 의식: 동일 데이터에 대해 동일 참조 유지(memo 친화)

## 에러 핸들링

- API 함수: throw (React Query가 catch)
- Hook: `error` 상태 노출
- Component: `if (error) return <ErrorState />`
- 사용자에게 노출되는 메시지는 한국어로 (l10n 도입 시 키로 교체)

```tsx
function MakgeolliListPage() {
  const { data, isLoading, error } = useMakgeolliList();
  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="목록을 불러오지 못했어요" />;
  return <MakgeolliGrid items={data ?? []} />;
}
```

## 참조 (프로젝트 문서)

- 데이터 흐름: `docs/architecture/data-flow.md`
- 폴더 구조: `docs/architecture/structure.md`
- 코딩 스타일: `docs/coding/style.md`
- 도메인 모델: `docs/coding/models.md`
- Supabase: `docs/services/supabase.md`
- Apps in Toss: `docs/services/apps-in-toss.md`
- iOS 참조: `docs/references/ios-project.md`
