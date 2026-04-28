---
name: julook-web
description: Julook 웹 미니앱(Vite + React 19 + TypeScript + @apps-in-toss/web-framework)의 모든 코드 변경을 TDD Phase 0~5 게이트로 진행하는 통합 오케스트레이터. 사용자 자연어 입력을 받아 (1) 버그 수정 / (2) 새 기능 개발 / (3) 리팩토링 / (4) 빌드·테스트·푸시 점검으로 자동 분류한 뒤, React Hook 설계·Vitest 테스트·Apps in Toss SDK 연동·pre-push 체크 등 모든 하위 작업을 이 스킬 안에서 처리한다. "고쳐줘", "작동 안 함", "기능 추가해줘", "페이지 추가", "Hook 만들어줘", "리팩토링", "정리해줘", "구조 개선", "TDD로 구현", "이어서 진행", "Phase N부터 다시", "커밋 전 체크", "푸시 전 점검", "빌드 확인" 같은 요청에 반드시 이 스킬을 사용할 것. 단순 질문이나 문서 읽기는 트리거하지 않는다.
---

# Julook Web — TDD Feature Development Orchestrator

Julook 웹 미니앱(Vite + React 19 + TypeScript + Apps in Toss SDK)의 **모든 코드 변경**을 TDD Phase 0~5 게이트로 조율한다. iOS 본앱(`/Users/kimsunghun/Desktop/julook/`)이 도메인/스키마/브랜드의 단일 진실이므로, 도메인 의문 발생 시 본앱 문서를 먼저 참조한다.

**🔴 최우선 규칙**: 단 한 줄의 프로덕션 코드도 실패하는 테스트 없이 수정/추가 금지.

## Step 1 — 의도 분류 (Intent Classification)

사용자 입력을 다음 4가지 중 하나로 분류한다. 애매하면 사용자에게 확인.

| 의도 | 키워드·징후 | 사이클 변형 |
|------|------------|-----------|
| **A. 버그 수정** | "고쳐줘", "작동 안 함", "깨진다", "이상하게 나옴", "X 했더니 Y 에러" | `red → (green) → refactor → (green)` — **재현 테스트 먼저**, 증상 제거 후 근본 설계 정리 |
| **B. 새 기능** | "추가해줘", "만들어줘", "페이지 추가", "기능 붙여", "Hook/Component 추가" | 4단계 모두 (`red → green → refactor → green`) |
| **C. 리팩토링** | "정리", "리팩토링", "구조 개선", "중복 제거", "이름 바꾸기" | **커버리지 확보 → refactor → green**. 테스트 부족 시 characterization test 먼저 |
| **D. 검증/점검** | "커밋 전 체크", "푸시 전 점검", "빌드 확인", "테스트 돌려봐" | Phase 4~5만 실행 (`julook-web-verification` 참조) |

**분류 불명확 시**: "이건 버그 수정인가요, 새 기능인가요?" 사용자에게 되묻는다. 추측 금지.

**사이클 외 작업** (이 스킬 사용하지 않음):
- 정적 리소스 (`public/*.png`, `*.svg`)
- 설정 (`granite.config.ts`, `vite.config.ts`, `tsconfig.*.json`) — 단 동작이 바뀌면 통합 테스트 필요
- 문서 (`.md`), 순수 타이포/주석

## Step 2 — 컨텍스트 확인

`_workspace/` 디렉터리 상태로 실행 모드 결정:

| 상태 | 실행 모드 |
|------|----------|
| `_workspace/` 없음 | Phase 0부터 전체 실행 |
| `_workspace/` 존재 + "이어서" | 마지막 완료 Phase 다음부터 재개 |
| `_workspace/` 존재 + "Phase N만 다시" | 해당 Phase 재실행 + 이후 Phase 연쇄 재검증 |
| `_workspace/` 존재 + 새 요청 | `_workspace/` → `_workspace_prev/` 이동 후 Phase 0 시작 |

## Step 3 — 팀 구성

5인 에이전트 팀 생성 (모두 `model: "opus"`):

```
TeamCreate(
  team_name="julook-web-tdd-feature",
  members=[
    "tdd-orchestrator",       # 리더
    "requirements-analyst",   # Phase 0
    "test-author",            # Phase 1 (또는 재현/characterization)
    "feature-implementer",    # Phase 2 + 3
    "qa-verifier"             # Phase 4 + 5
  ]
)
```

의도가 **D. 검증/점검**이면 `qa-verifier`만 사용 (팀 생성 생략 가능).

## Step 4 — Phase 순서 (사이클 변형에 따라 조정)

### A. 버그 수정

1. **Phase 0 (requirements-analyst)**: 재현 조건과 기대 결과를 한 줄 정의
2. **Phase 1 RED (test-author)**: 버그를 재현하는 실패 테스트 작성 ("X 상황 → 현재 Y, 기대 Z")
3. **Phase 2 GREEN (feature-implementer)**: 증상을 없애는 최소 수정
4. **Phase 3 REFACTOR (feature-implementer)**: 버그 주변 설계 정리 ("버그는 설계 문제의 증상")
5. **Phase 4 (qa-verifier)**: 회귀 없음 확인
6. **Phase 5 (qa-verifier)**: `🐛 [fix]` 커밋

### B. 새 기능

1. **Phase 0**: Hook 시그니처 + State 전이 + 사용자 시나리오 명세
2. **Phase 1 RED**: Vitest + RTL 실패 테스트 (해피 + 실패 경로)
3. **Phase 2 GREEN**: Hook/Component 최소 구현
4. **Phase 3 REFACTOR**: Component 분리, 중복 추출, 폴더 정리
5. **Phase 4**: `npm run lint && npm run typecheck && npm test && npm run build` green
6. **Phase 5**: `✨ [feat]` 커밋

### C. 리팩토링

1. **Phase 0**: 리팩토링 범위와 "기능 불변" 선언
2. **Phase 1 (characterization)**: 현 동작을 포착하는 테스트 (없으면 먼저 추가)
3. **Phase 3 REFACTOR**: 작은 단위로 구조 변경
4. **Phase 4**: 각 단위 직후 재검증
5. **Phase 5**: `♻️ [refactor]` 커밋 (기능 추가와 분리)

### D. 검증/점검

1. **Phase 4**: lint/typecheck/test/build + 경계면 shape 검증
2. **Phase 5**: pre-push 차단 항목 전수 사전 체크 (브랜치, Secrets, console, 라인 제한, 테스트 동반, 빌드/테스트)

## Step 5 — 하위 작업별 참조 문서

Phase 진행 중 특정 작업이 필요하면 해당 reference 파일을 로드한다:

| 상황 | 참조 파일 |
|------|----------|
| Hook/State/API 함수/Component 설계 | `references/feature-design.md` |
| Vitest 테스트 작성, 실패 테스트, 모킹, 타이머 제어 | `references/test-writing.md` |
| 새 페이지 생성, 라우트 등록, feature 폴더 신설 | `references/module-setup.md` |
| 빌드/테스트/pre-push 차단 항목 전수 점검 | `references/julook-web-verification.md` |
| Phase 0~5 진입/완료 조건, 사이클 크기 경보 | `references/phase-gates.md` |
| 팀 생성, 데이터 전달, 에러 전파, 재실행 시나리오 | `references/orchestration.md` |

## 데이터 전달

- **파일 기반 (주)**: `_workspace/{phase}_{artifact}.md`에 각 Phase 산출물
- **메시지 기반**: `SendMessage`로 Phase 전환 알림, 문제 즉시 리포트
- **태스크 기반**: `TaskCreate` + `blockedBy`로 Phase 순서 강제

```
_workspace/
├── 00_requirements.md
├── 01_red_tests.md
├── 02_green_diff.md
├── 03_refactor_diff.md
├── 04_verification.md
└── 05_review.md
```

## 에러 핸들링

| 상황 | 대응 |
|------|------|
| 의도 분류 실패 | 사용자에게 되묻기 (추측 금지) |
| Phase 1 테스트가 처음부터 통과 | test-author에게 반환, 재현 조건 재확인 |
| Phase 2 전체 테스트 실패 | feature-implementer가 최소 코드로 축소 |
| Phase 4 재검증 실패 | 방금 리팩토링 `git restore` + Phase 3 더 작게 쪼개기 |
| pre-push 차단 위반 감지 | 즉시 사용자 보고, 우회 금지 |
| 사이클이 10분 초과 | Phase 0으로 돌아가 요구사항 쪼개기 |

## 테스트 시나리오

### 시나리오 1 — 버그 수정 (의도 A)
**입력**: "Home 화면에서 새로고침 후 로딩이 안 끝나"
- 의도 분류: **A (버그)**
- Phase 0: "refresh 응답 도착 시 `isRefreshing` false로 복원되어야 한다"
- Phase 1 RED: `it("when refresh response arrives, sets isRefreshing to false")` — 현재 실패
- Phase 2: `useMakgeolliList` hook의 응답 처리에 `setIsRefreshing(false)` 추가
- Phase 4: 회귀 0건
- Phase 5: `🐛 [fix] 홈 새로고침 종료 상태 복구` 커밋

### 시나리오 2 — 새 기능 (의도 B)
**입력**: "막걸리 목록에 정렬 추가 (최신/이름/평점)"
- 의도 분류: **B (기능)**
- Phase 0: `SortOrder` union + `useMakgeolliList({ sort })` 인자 + 정렬 로직
- Phase 1~5 전체 사이클
- Phase 5: `✨ [feat] 막걸리 목록 정렬 추가` 커밋

### 시나리오 3 — 리팩토링 (의도 C)
**입력**: "Home 페이지 너무 커. 필터 분리"
- 의도 분류: **C (리팩토링)**
- Phase 0: 기능 불변, `useFilter` hook + `<FilterPanel>` 컴포넌트로 분리 범위 선언
- Phase 1: 기존 Home의 필터 동작을 characterization test로 포착
- Phase 3: 추출, 컴포지션
- Phase 4: 각 추출 단계 직후 녹색 확인
- Phase 5: `♻️ [refactor] 필터 로직 useFilter로 분리` 커밋

### 시나리오 4 — 검증 (의도 D)
**입력**: "푸시하기 전에 체크해줘"
- 의도 분류: **D (검증)**
- Phase 4+5만 실행 — `references/julook-web-verification.md` 참조
- 결과: 차단 항목 통과/실패 리포트, 실패 항목은 해당 에이전트에 반환

## iOS 본앱 참조 의무

도메인/스키마/브랜드 의문 발생 시:

| 의문 | 본앱 참조 |
|------|----------|
| Makgeolli 필드 무엇인가 | `/Users/kimsunghun/Desktop/julook/Projects/Domain/Sources/Models/` |
| Supabase 테이블 컬럼 | `/Users/kimsunghun/Desktop/julook/docs/database/schema.md` |
| RLS / 인증 흐름 | `/Users/kimsunghun/Desktop/julook/docs/services/supabase.md` |
| 브랜드 색상/아이콘 | `/Users/kimsunghun/Desktop/julook/docs/ui/design-system.md` |
| 로컬라이제이션 키 | `/Users/kimsunghun/Desktop/julook/docs/coding/localization.md` |

전체 매핑: `docs/references/ios-project.md`.

## 참조 문서 (프로젝트)

- 사이클 정의: `docs/tdd/cycle.md`
- Phase 게이트: `docs/tdd/phases.md`
- 새 기능 워크플로우: `docs/workflow/feature.md`
- 버그 수정 워크플로우: `docs/workflow/bugfix.md`
- 리팩토링 워크플로우: `docs/workflow/refactor.md`
- 코딩 규칙: `docs/coding/style.md`, `docs/coding/models.md`
- 서비스: `docs/services/supabase.md`, `docs/services/apps-in-toss.md`
- 테스트: `docs/testing/writing.md`
- 푸시 차단: `docs/git/push-check.md`
- 커밋 규칙: `docs/git/commit.md`
