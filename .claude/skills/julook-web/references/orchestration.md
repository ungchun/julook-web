# 오케스트레이션 상세 (Web)

## 팀 생성과 작업 할당

### Step 1: 팀 생성

```
TeamCreate(
  team_name="julook-web-tdd-feature",
  members=[
    "tdd-orchestrator",
    "requirements-analyst",
    "test-author",
    "feature-implementer",
    "qa-verifier"
  ]
)
```

### Step 2: 작업 생성 (의존성으로 Phase 순서 강제)

```
Task #0: Phase 0 — 요구사항 확정 (owner: requirements-analyst)
Task #1: Phase 1 — RED 실패 테스트 (owner: test-author, blockedBy: [#0])
Task #2: Phase 2 — GREEN 최소 구현 (owner: feature-implementer, blockedBy: [#1])
Task #3: Phase 3 — REFACTOR (owner: feature-implementer, blockedBy: [#2])
Task #4: Phase 4 — GREEN 재검증 (owner: qa-verifier, blockedBy: [#3])
Task #5: Phase 5 — 리뷰 & 커밋 (owner: qa-verifier, blockedBy: [#4])
```

### Step 3: 리더의 모니터링 역할

tdd-orchestrator는 작업을 직접 수행하지 않고:
- 각 Task의 `in_progress` 전환 모니터링
- 완료된 Phase의 산출물(`_workspace/*.md`) 검수
- 에러/차단 발생 시 재분배 또는 사용자 에스컬레이션
- Phase 전환 시 다음 에이전트에 `SendMessage`로 입력 파일 경로 전달

## 파일 기반 데이터 전달

**이유**: 팀원 간 컨텍스트 분리를 위해. 각 에이전트는 자기 입력 파일만 읽고 출력 파일만 쓴다. 메시지는 "파일 경로 + 한 줄 요약"만.

```
_workspace/
├── 00_requirements.md        # Phase 0 → Phase 1 입력
├── 01_red_tests.md           # Phase 1 → Phase 2 입력
├── 02_green_diff.md          # Phase 2 → Phase 3 입력
├── 03_refactor_diff.md       # Phase 3 → Phase 4 입력
├── 04_verification.md        # Phase 4 → Phase 5 입력
└── 05_review.md              # Phase 5 최종 산출물
```

Phase 3→4는 여러 번 왕복할 수 있으므로 같은 파일을 덮어쓰거나 `03_refactor_diff.md`에 append.

## 메시지 프로토콜

### 정상 전환
```
From: requirements-analyst
To: test-author
Content: "Phase 0 완료. 산출물: _workspace/00_requirements.md. Phase 1 진행하세요."
```

### 차단/재요청
```
From: tdd-orchestrator
To: test-author
Content: "Phase 1 재작업: 테스트가 처음부터 통과함. 실제로 실패하는 테스트로 재작성 필요."
```

### 리더 에스컬레이션
```
From: qa-verifier
To: tdd-orchestrator
Content: "Phase 4 실패: typecheck 에러. {파일:줄} {에러 요약}. 담당 Phase 식별 필요."
```

## 재실행 시나리오

### 시나리오 A: "Phase 3만 다시"

1. `_workspace/03_refactor_diff.md` 존재 확인
2. `_workspace/03_refactor_diff.md` 를 `_workspace/03_refactor_diff_prev.md` 로 이동
3. feature-implementer를 Phase 3부터 재호출
4. Phase 4~5 연쇄 재검증

### 시나리오 B: "이어서 진행"

1. `_workspace/` 파일들을 확인하여 마지막 완료 Phase 식별
2. 마지막+1 Phase부터 재개
3. 만약 Phase 3에서 멈춤 → feature-implementer에게 "Phase 3 이어서" 지시

### 시나리오 C: "전혀 새 기능"

1. `_workspace/`를 `_workspace_prev/`로 이동 (이전 산출물 보존)
2. Phase 0부터 시작

### 시나리오 D: 긴급 수정 (동일 기능 내 버그)

1. requirements-analyst가 "기존 Phase 0 위에 추가 요구사항" 문서 작성
2. test-author가 새 실패 테스트 추가
3. Phase 2~5 동일 흐름

## 팀 해체와 재구성

한 사이클 완료 후에도 팀은 유지한다. 같은 세션에서 다음 기능 요청이 들어오면:
- `_workspace/` → `_workspace_prev/` 이동
- 팀 유지, 새 Phase 0 시작

세션 종료 시 팀 자동 해체 (harness 플랫폼 기본 동작).

## 실패 전파

| Phase 실패 | 전파 경로 |
|-----------|-----------|
| Phase 1 RED 실패 | test-author → tdd-orchestrator → (재작성 or 사용자 에스컬레이션) |
| Phase 2 GREEN 실패 | feature-implementer → tdd-orchestrator → (최소 코드 축소 재시도) |
| Phase 3 리팩토링으로 기능 깨짐 | qa-verifier → feature-implementer → (`git restore` 후 더 작게 쪼개기) |
| Phase 4 빌드/테스트 실패 | qa-verifier → tdd-orchestrator → (원인 Phase 식별 후 담당자 반환) |
| Phase 5 pre-push 체크 실패 | qa-verifier → 해당 에이전트 (`console.log` → feature-implementer, 테스트 누락 → test-author) |

## 1회 재시도 규칙

각 Phase는 1회 자동 재시도, 재실패 시 사용자에게 보고. 무한 루프 방지를 위해 tdd-orchestrator가 재시도 횟수 카운트.

## 사용자 개입이 필요한 시점

다음 상황에서 자동 진행 중단, 사용자 질문:
1. 요구사항 모호 (Phase 0)
2. Phase 1 재시도 2회 실패 (테스트가 계속 처음부터 통과)
3. Phase 4 환경 문제 (npm install 누락, 의존성 깨짐 등)
4. pre-push 차단 항목 위반인데 우회가 필요한 경우
5. 사이클이 10분 초과 — 쪼개야 할지 판단
6. iOS 본앱 도메인 모델과 충돌 발견 — 본앱 변경 필요한지 결정
