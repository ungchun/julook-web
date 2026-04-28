---
참조:
  - ../tdd/cycle.md
  - ../tdd/phases.md
피참조:
  - ../../CLAUDE.md
  - ../workflow/feature.md
검증:
  - vitest.config.ts (생성 예정)
  - src/test/setup.ts (생성 예정)
---

# 테스트 작성 (Vitest + RTL)

## 도구

| 용도 | 도구 |
|------|------|
| 테스트 러너 | Vitest |
| 컴포넌트 테스트 | React Testing Library |
| API 모킹 | `vi.mock` 또는 MSW (선택) |
| 사용자 이벤트 | `@testing-library/user-event` |
| Matchers | `@testing-library/jest-dom` |

## 파일 위치

- 컴포넌트 옆에 코로케이트: `MakgeolliCard.test.tsx`
- 통합/페이지 단위: `src/__tests__/` 또는 페이지 폴더 내

## 테스트 이름 규약

`describe('대상')` → `it('조건이면 결과한다')` (한국어 OK).

## TDD 사이클 매핑 (iOS TestStore → Vitest)

| 의도 | iOS (TCA TestStore) | Web (Vitest + RTL) |
|------|---------------------|--------------------|
| Action 보내고 State 검증 | `await store.send(.x) { $0.y = z }` | hook 호출 후 `expect(result.current.y).toBe(z)` |
| Effect/비동기 결과 | `await store.receive(.response(...))` | `await waitFor(() => expect(...))` |
| 의존성 치환 | `withDependencies { $0.client = .testValue }` | `vi.mock('@/.../api')` |
| 사용자 입력 | (없음, Action 직접) | `userEvent.click(button)` |

## RED 단계 체크 (Phase 1)

1. 새 테스트가 **실제로 실패**하는지 콘솔에서 직접 확인
2. 실패 메시지가 우리가 기대한 이유로 나오는지 확인 (오타로 실패하는 거 아닌지)
3. 그 후에야 구현 시작

## 모킹 원칙

- 외부 IO(supabase, fetch, Apps in Toss SDK)는 모킹
- 내부 모듈(같은 feature 안의 다른 함수)은 모킹 금지 — 통합으로 검증
- `vi.useFakeTimers()`는 필요할 때만, 사용 후 `vi.useRealTimers()` 복구

## 금지

- 스냅샷 테스트 남발 (의도 불명확하면 안 씀)
- 테스트 안에서 콘솔 로그 잔존
- 한 테스트가 여러 책임 검증 (split하라)
