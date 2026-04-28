---
참조:
  - structure.md
  - ../services/supabase.md
피참조:
  - ../../CLAUDE.md
검증:
  - src/shared/lib/supabase.ts
---

# 아키텍처: 데이터 흐름

## 기본 흐름

```
[Page/Component]
   ↓ (hook 호출)
[feature hook]   ← React Query 권장
   ↓
[feature/api]    ← supabase 클라이언트 호출 함수
   ↓
[Supabase]
```

- 컴포넌트는 hook만 호출. supabase 직접 호출 금지.
- hook은 캐싱/재요청 정책 담당. 컴포넌트는 상태 모름.
- api 함수는 입력/출력 타입을 명시. supabase의 `data, error` 분기는 여기서 처리.

## 에러 처리

- API 함수는 throw하거나 `{ data, error }` 둘 중 하나의 규약을 일관되게 채택
- 컴포넌트 단에서 try/catch 산발적 사용 금지 — hook 또는 ErrorBoundary로 통일

## Apps in Toss SDK 호출

`@apps-in-toss/web-framework` API (예: `requestReview`, 토스 로그인)는 `src/shared/lib/toss.ts` 같은 wrapper에서만 호출.
직접 컴포넌트에서 import 금지 — 테스트 모킹 단일 지점 확보.

## 상태 카테고리

| 종류 | 도구 | 예시 |
|------|------|------|
| 서버 상태 | React Query | 막걸리 목록, 상세 |
| 전역 클라이언트 상태 | Zustand (필요 시) | 검색 필터, 사용자 선호 |
| 로컬 UI 상태 | useState | 모달 open/close, 입력 값 |
| URL 상태 | 라우터 search params | 페이지, 카테고리 |
