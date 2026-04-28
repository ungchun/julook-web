---
참조:
  - ../tdd/cycle.md
피참조:
  - ../../CLAUDE.md
  - ../workflow/feature.md
검증:
  - vite.config.ts
  - granite.config.ts
  - package.json
---

# 아키텍처: 구조

## 스택

| 레이어 | 기술 |
|--------|------|
| 빌드 | Vite 6 + TypeScript 5.7 |
| UI | React 19 |
| 런타임 | Granite (`@apps-in-toss/web-framework`) → 토스 앱 내 WebView |
| 상태 | (TBD: Zustand 권장 — TCA 직접 대응 라이브러리 없음) |
| 데이터 | Supabase (iOS와 동일 인스턴스 공유) |
| 라우팅 | (TBD: React Router 또는 파일 기반) |
| 테스트 | Vitest + React Testing Library |

## 폴더 구조 (목표)

```
src/
├── app/              # 앱 진입점 (main.tsx, App.tsx)
├── pages/            # 라우트 단위 화면
│   ├── Home/
│   ├── MakgeolliDetail/
│   └── Search/
├── features/         # 도메인 단위 (찜, 평점, 리뷰 등)
│   └── {feature}/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       └── __tests__/
├── shared/
│   ├── ui/           # 디자인 시스템 컴포넌트
│   ├── lib/          # 유틸, supabase 클라이언트
│   └── types/        # 도메인 타입 (iOS Models와 일치 유지)
└── test/
    └── setup.ts      # Vitest 설정
```

## 의존 방향

```
pages → features → shared
features ↛ pages
shared ↛ features, pages
```

상위 레이어는 하위만 참조. 역방향 import 금지.

## Apps in Toss 진입 규약

- `granite.config.ts` 가 앱 메타데이터 단일 진실 (`appName`, `displayName`, `primaryColor`, `icon`, `permissions`)
- 스킴: `intoss://julook-web`
- 빌드: `npm run build` → `dist/` + `<appName>.ait`

## iOS 본앱과의 관계

도메인 개념(Makgeolli, Award, User 등)은 **iOS의 `coding/models.md` 가 정의 기준**.
Web은 `src/shared/types/`에 동일한 필드 구조의 TypeScript 타입을 둔다.
필드 추가/변경 시 iOS와 동기화 필수 (Supabase 스키마는 한 쪽이 단독 변경 불가).
