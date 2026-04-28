# Phase 게이트 상세 (Web)

각 Phase의 진입 조건, 작업 내역, 완료 조건을 `docs/tdd/phases.md`와 `docs/tdd/cycle.md`를 기반으로 정리.

## Phase 0: 요구사항 확정

**진입 조건**: 사용자 요청이 있음.

**작업**:
1. 요청을 "X 조건에서 Y 결과"로 검증 가능한 형태로 변환
2. 영향 페이지/feature 식별 (`pages/Home`, `pages/MakgeolliDetail`, `features/{name}` 등)
3. State 전이 설계 (초기 → 액션 → 결과)
4. Hook/Action 명세 (이름 + 인자 타입)
5. 필요한 외부 의존성 식별 (`@/shared/lib/supabase`, `@/shared/lib/toss`, `@/shared/lib/queryClient`)
6. iOS 본앱 동일 기능 존재 시 참조 (`/Users/kimsunghun/Desktop/julook/Projects/...`)

**완료 조건**:
- "이 동작을 증명할 테스트 이름"이 한 문장으로 써진다
- 예: `it("when refresh response arrives, sets isRefreshing to false")`
- 불명확하면 사용자에게 되물음 (추측 금지)

**산출물**: `_workspace/00_requirements.md`

## Phase 1: RED — 실패 테스트

**진입 조건**: Phase 0 산출물 존재 + 테스트 이름 확정.

**작업**:
1. `src/**/*.test.{ts,tsx}` 작성, 프로덕션 코드(`src/**/*.{ts,tsx}` 중 `*.test.*` 제외) 절대 안 건드림
2. Vitest + React Testing Library 기반 (`docs/testing/writing.md` 형식)
3. 외부 의존성은 `vi.mock` 으로 치환
4. 해피 패스 + 실패 경로 둘 다
5. 새 feature 폴더 필요 시 `references/module-setup.md` 절차로 생성

**실패 확인**:
- `npm test` 실행
- 새 테스트만 실패 (기존은 영향 없음)
- 처음부터 통과하면 잘못된 테스트 — 재작성

**완료 조건**: 실패 로그에 새 테스트 이름 + 예상/실제 diff가 보임.

**산출물**: `_workspace/01_red_tests.md` (실패 로그 인용 포함)

## Phase 2: GREEN — 최소 구현

**진입 조건**: Phase 1 실패 로그 존재.

**작업**:
1. **처음으로** 프로덕션 코드(`src/**/*.{ts,tsx}` non-test) 수정
2. Phase 1 실패 테스트를 통과시키는 최소 코드
3. 일반화 금지 ("다음에 쓸지도 모르니" 추상화 X)
4. React/TS 컨벤션 준수 (`docs/coding/style.md`)
5. SDK 호출은 `@/shared/lib/{toss,supabase}` wrapper 경유
6. `npm test` → 녹색 확인

**흔한 함정**:
- "깔끔하게 쓰고 싶어서" 리팩토링 겸하기 → Phase 3에서 분리
- Component에 비즈니스 로직 → Hook으로
- `console.log` 사용 → 배포 전 제거 (또는 logger 유틸 도입)
- supabase/toss 직접 import → wrapper(`@/shared/lib/...`) 경유

**완료 조건**: `npm test` 녹색.

**산출물**: `_workspace/02_green_diff.md`

## Phase 3: REFACTOR — 주변 설계 개선

**진입 조건**: Phase 2 green.

**작업** (작은 단위로 분리):
1. 이번 변경 주변의 중복 추출
2. 이름 개선
3. Component 분리 (관심사 단위)
4. Hook 분해 (useX → useXState + useXEffects)
5. 각 리팩토링 직후 Phase 4 재검증

**금지**:
- 기능 변경 (동작이 달라지면 Phase 1~2 다시)
- 테스트 추가/삭제
- 큰 단위 변경 (한 번에 여러 개)

**완료 조건**: 더 고칠 것이 없다고 판단될 때까지 Phase 3→4 왕복.

**산출물**: `_workspace/03_refactor_diff.md`

## Phase 4: GREEN 재검증

**진입 조건**: Phase 3의 각 리팩토링 단위 직후.

**작업**:
1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run build` (필요 시)
5. 경계면 shape 일치 검증 (Hook ↔ Component, API 함수 ↔ supabase 컬럼, SDK wrapper ↔ 사용처)

**실패 시**:
- 방금 리팩토링 `git restore`로 되돌림
- Phase 3을 더 작게 쪼개 재시도
- 반복 실패 시 tdd-orchestrator가 사용자에게 보고

**완료 조건**: 모든 명령 통과 + 회귀 0건.

**산출물**: `_workspace/04_verification.md`

## Phase 5: 리뷰 & 커밋

**진입 조건**: Phase 3~4 왕복 완료 ("더 고칠 것 없음" 판단).

**작업**:
1. `git diff --cached` 최종 검토
2. pre-push 차단 항목 전수 사전 체크 (`docs/git/push-check.md`):
   - 브랜치 ≠ main (PR 경유)
   - Secrets 변경 없음 + `sk_live`/`api_key=` 리터럴 없음
   - `console.log`/`debugger` 없음
   - 한글 하드코딩 없음 (또는 의도 주석)
   - `src/` 변경이 있으면 `*.test.*` 변경도 있음
   - lint + typecheck + test + build 모두 통과
3. 커밋 메시지: `{이모지} [{type}] {한 줄 요약}` (`docs/git/commit.md`)
4. 한 커밋 = 한 사이클 (Phase 1+2+3+4를 한 커밋에)

**산출물**: `_workspace/05_review.md`

## 사이클 크기 경보

**한 사이클이 10분을 넘기면 사이클이 너무 크다는 신호**. 대응:
1. tdd-orchestrator가 중단 지시
2. Phase 0으로 돌아가 요구사항을 더 작게 쪼갬
3. 예: "정렬 기능 전체" → "SortOrder 타입 정의" + "useMakgeolliList sort 인자 처리" + "UI 셀렉터 연결"

**왜**: 긴 사이클은 TDD의 "빨간 피드백 루프"를 무력화. 실패-통과 간격이 길면 디버깅 비용이 폭증.

## Phase 건너뛰기 금지

어떤 Phase도 건너뛸 수 없다. "이건 간단하니까 테스트 없이" 식 예외는 docs/tdd 위반이며 pre-push에서 차단됨.

예외 가능 범위(테스트 없이 수정 허용):
- 정적 리소스 (`public/`)
- 설정 (`granite.config.ts`, `vite.config.ts`, `tsconfig.*.json`, `eslint.config.js`) — 단, 동작이 바뀌면 통합 테스트 필요
- 문서 (`.md`)
- 순수 타이포/주석

이 외에는 모두 Phase 0~5 사이클 적용.
