---
참조:
  - ../tdd/cycle.md
  - ../tdd/phases.md
  - ../testing/writing.md
피참조:
  - ../../CLAUDE.md
검증: []
---

# 워크플로우: 새 기능 추가

## Phase 0 — 요구사항 명세

- 한 문장으로 검증 가능한 형태로: "X 입력 → Y 결과"
- 화면 이름, 진입 경로, 사용자 액션, 기대 결과를 정리
- 영향 받는 도메인 모델/Supabase 테이블/SDK API 식별
- iOS 본앱에 같은 기능 있으면 그쪽 동작 확인 (`/Users/kimsunghun/Desktop/julook/`)

## Phase 1 — RED (실패 테스트 먼저)

- 가장 외곽 사용자 시나리오부터 테스트 작성 (RTL `userEvent` 기반)
- hook 단위 테스트는 그 다음
- API 함수 단위 테스트는 마지막
- **반드시 한 번 실행해서 실패 확인** (`npm test`)
- 실패 메시지가 우리가 의도한 사유인지 검증

## Phase 2 — GREEN (최소 구현)

- 테스트만 통과시킨다. 더 안 한다.
- 타입 우회 (`any`, `as`)로 통과시키지 말 것 — 정공법
- supabase 호출은 모킹된 상태로 둘 수도, 실제 연결할 수도 있음 (테스트 정의에 따름)

## Phase 3 — REFACTOR

- 중복 제거, 이름 다듬기, 추출
- 공통화는 **3번째 사용처 등장 시**만
- 테스트는 그대로 통과해야 함 — 통과 안 하면 리팩이 아니라 동작 변경

## Phase 4 — GREEN 재검증

```bash
npm run lint
npm run build
npm test
```
모두 통과해야 종료.

## Phase 5 — 리뷰 & 커밋

- diff 자가 점검: [git/commit.md](../git/commit.md)
- 푸시 전: [git/push-check.md](../git/push-check.md)
- 커밋 메시지는 ✨ [feat] 접두

## Apps in Toss 영향 체크

- 새 SDK API 사용? → `permissions` 필드에 추가 필요한지 확인
- 새 화면? → 라우팅 경로 + 깊은링크(`intoss://julook-web/...`) 동작 확인
- 번들 크기 임계 근접? → 이미지 최적화 / 코드 스플리팅 검토
