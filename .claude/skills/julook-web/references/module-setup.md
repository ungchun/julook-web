---
name: module-setup
description: julook-web에 새 페이지/feature 폴더/라우트를 추가하는 스킬. 폴더 구조, 라우트 등록, 배럴 파일, path alias 사용을 다룬다. 새 화면/기능 폴더 생성 시 반드시 사용할 것.
---

# Module Setup (Web)

julook-web은 Vite + React Router 7 기반. 이 스킬은 새 페이지/feature 추가 절차를 담는다.

## 언제 이 스킬을 사용하는가

- 새 페이지(`src/pages/{Name}`) 추가
- 새 feature(`src/features/{name}`) 폴더 신설
- 라우트 등록 (`src/app/App.tsx`)
- 공유 컴포넌트(`src/shared/ui/`) 추가
- 도메인 타입(`src/shared/types/`) 추가

## 폴더 트리

```
src/
├── app/                       앱 진입점 (라우터 + Provider)
├── pages/                     라우트 단위 화면
│   └── {PageName}/
│       ├── {PageName}.tsx
│       ├── {PageName}.test.tsx
│       └── index.ts
├── features/                  도메인 단위 (찜, 평점, 리뷰 등)
│   └── {feature-name}/
│       ├── api/
│       ├── hooks/
│       ├── components/
│       ├── __tests__/   (또는 코로케이트)
│       └── index.ts
├── shared/
│   ├── ui/                    공통 컴포넌트
│   ├── lib/                   wrapper (supabase, toss, queryClient)
│   └── types/                 도메인 타입 (iOS 미러)
└── test/
    └── setup.ts
```

## 의존 방향

```
pages → features → shared
features ↛ pages
shared ↛ features, pages
```

상위 레이어는 하위만 참조. 역방향 import 금지. **왜**: 순환 의존 방지, 변경 영향 범위 예측 가능.

## 새 페이지 추가 절차

### 1. 폴더 + 파일 생성

```
src/pages/MakgeolliDetail/
├── MakgeolliDetail.tsx
├── MakgeolliDetail.test.tsx
└── index.ts
```

### 2. 페이지 컴포넌트 (최소)

```tsx
// MakgeolliDetail.tsx
import { useParams } from "react-router-dom";

export function MakgeolliDetail() {
  const { id } = useParams<{ id: string }>();
  return <main>막걸리 상세 #{id}</main>;
}
```

### 3. 배럴

```ts
// index.ts
export { MakgeolliDetail } from "./MakgeolliDetail";
```

### 4. 라우트 등록

```tsx
// src/app/App.tsx
import { MakgeolliDetail } from "@/pages/MakgeolliDetail";

<Route path="/makgeolli/:id" element={<MakgeolliDetail />} />
```

### 5. 테스트

```tsx
// MakgeolliDetail.test.tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MakgeolliDetail } from "./MakgeolliDetail";

it("renders the makgeolli id from URL", () => {
  render(
    <MemoryRouter initialEntries={["/makgeolli/42"]}>
      <Routes>
        <Route path="/makgeolli/:id" element={<MakgeolliDetail />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/막걸리 상세 #42/)).toBeInTheDocument();
});
```

## 새 Feature 추가 절차

### 1. 폴더 트리

```
src/features/makgeolli-list/
├── api/
│   └── fetchMakgeolliList.ts
├── hooks/
│   └── useMakgeolliList.ts
├── components/
│   └── MakgeolliCard.tsx
└── index.ts
```

### 2. 외부 노출 (배럴)

```ts
// src/features/makgeolli-list/index.ts
export { useMakgeolliList } from "./hooks/useMakgeolliList";
export { MakgeolliCard } from "./components/MakgeolliCard";
export type { Makgeolli } from "@/shared/types/makgeolli";
```

내부 구현(api/, 내부 hook 등)은 노출하지 않음. **왜**: 사용처가 깊은 경로 import 하면 리팩토링 어려움.

### 3. Page에서 사용

```tsx
// src/pages/Home/Home.tsx
import { useMakgeolliList, MakgeolliCard } from "@/features/makgeolli-list";

export function Home() {
  const { data, isLoading } = useMakgeolliList();
  if (isLoading) return <Spinner />;
  return (
    <ul>
      {data?.map((m) => <MakgeolliCard key={m.id} makgeolli={m} />)}
    </ul>
  );
}
```

## 공통 컴포넌트(`src/shared/ui/`) 추가

여러 feature/page가 같은 UI를 쓰는 게 확인되면(2번째 사용처 등장 시) 추출:

```
src/shared/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── index.ts
└── Spinner/
    ├── ...
```

**왜 2번째부터?**: 1번 등장 시 "공통화"는 추측. 2번째 등장 시 패턴이 드러난다.

## 도메인 타입(`src/shared/types/`) 추가

iOS 본앱의 Domain 모델을 미러링한다:

```ts
// src/shared/types/makgeolli.ts
// 단일 진실: /Users/kimsunghun/Desktop/julook/Projects/Domain/Sources/Models/Makgeolli.swift
export interface Makgeolli {
  id: number;
  name: string;
  name_en: string | null;
  alcohol: number;
  // ... iOS 필드와 동일 구조
}
```

iOS에서 필드 추가/삭제 시 같은 PR로 web도 반영.

## Path Alias 사용

`@` = `src/`. 모든 import는 alias 사용:

```ts
// GOOD
import { supabase } from "@/shared/lib/supabase";
import { Home } from "@/pages/Home";

// BAD
import { supabase } from "../../shared/lib/supabase";
```

**왜**: 폴더 이동 시 import 경로 깨지지 않음. 가독성.

## 흔한 실패

| 증상 | 원인 | 대응 |
|------|------|------|
| `Cannot find module '@/...'` | tsconfig path 누락 또는 vite alias 누락 | `tsconfig.app.json`과 `vite.config.ts` 둘 다 확인 |
| 테스트는 통과 빌드 실패 | type-only import / SDK가 빌드 시점만 필요 | `import type` 사용 또는 dynamic import |
| 라우트 진입 후 404 | `<Route>` 등록 누락 | `src/app/App.tsx`에 추가 |
| circular dependency | feature가 page를 import | 의존 방향 점검, 공통은 shared로 |

## 참조 (프로젝트 문서)

- 폴더 구조: `docs/architecture/structure.md`
- 데이터 흐름: `docs/architecture/data-flow.md`
- 새 기능 워크플로우: `docs/workflow/feature.md`
- 테스트: `docs/testing/writing.md`
