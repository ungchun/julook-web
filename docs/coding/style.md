---
참조: []
피참조:
  - ../../CLAUDE.md
검증:
  - eslint.config.js
  - .prettierrc (있다면)
---

# 코딩 스타일

## TypeScript

- `any` 금지. 정 모르겠으면 `unknown` + 타입 가드.
- 함수 파라미터/반환은 명시적 타입. 단, 컴포넌트 props는 인라인 인터페이스 OK.
- `enum` 보다 `as const` 객체 + union 타입 선호.
- `null` 보다 `undefined` 일관 사용 (DB 직렬화 경계 제외).

## React

- 함수형 컴포넌트만. 클래스 금지.
- 파일당 하나의 default export 컴포넌트. 보조 컴포넌트는 named export.
- props는 destructure로 받음. `props.foo` 직접 참조 금지.
- effect 의존성은 ESLint 규칙(`react-hooks/exhaustive-deps`) 강제.

## 명명

- 컴포넌트: `PascalCase` (`MakgeolliCard.tsx`)
- 훅: `use` 접두 (`useMakgeolliList`)
- 유틸: `camelCase`
- 상수: `SCREAMING_SNAKE_CASE`
- 타입: `PascalCase`, 인터페이스도 `I` 접두 금지

## 폴더

- 컴포넌트 폴더는 `index.ts` 배럴 + `Component.tsx` + `Component.test.tsx` + `Component.module.css`
- 한 폴더가 5개 이상이면 분해

## 주석

- "무엇"을 적지 말 것. 코드가 말함.
- "왜"를 적을 것 (제약, 회피책, 외부 의존 행동).
- TODO에는 GitHub 이슈 번호 또는 작성자 + 조건 명시.

## 금지

- `console.log` 잔존 (배포 전 제거 — pre-push에서 차단)
- 한글 하드코딩 (l10n 키로 옮기거나 의도적이면 주석으로 명시)
- 매직 넘버 (의미 있는 상수로 추출)
