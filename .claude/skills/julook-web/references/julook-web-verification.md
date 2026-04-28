---
name: julook-web-verification
description: julook-web의 빌드/테스트 검증과 pre-push 차단 항목을 사전 점검하는 스킬. lint/typecheck/test/build 실행, main 푸시/Secrets 유출/console 사용/한글 하드코딩/테스트 동반 여부 체크를 자동화한다. Phase 4 재검증, Phase 5 커밋 준비, 푸시 직전 점검에 반드시 이 스킬을 사용할 것.
---

# Julook Web Verification

julook-web의 빌드·테스트·pre-push 규칙 전수 점검. 커밋/푸시 전 이 스킬로 모든 차단 항목을 사전 확인하여 실제 `git push`에서 막히지 않게 한다.

## 언제 이 스킬을 사용하는가

- Phase 4 (GREEN 재검증) — 리팩토링 후 전체 테스트 통과 확인
- Phase 5 (리뷰 & 커밋) — pre-push 항목 전수 체크
- 커밋 직전, 푸시 직전 최종 점검
- CI 실패 원인 추적 (로컬에서 동일 항목 재현)

## pre-push 차단 항목

| # | 항목 | 점검 방법 |
|---|------|-----------|
| 1 | main 직접 푸시 금지 | `git rev-parse --abbrev-ref HEAD` — `main`이면 중단 (PR 경유) |
| 2 | Secrets 유출 방지 | `.env`, `.env.local` staged 여부 + `sk_live`/`api[_-]?key=` 리터럴 grep |
| 3 | `console.log`/`debugger` 직접 사용 금지 | 스테이징된 `*.{ts,tsx}` 내 grep |
| 4 | 한글 하드코딩 | 사용자에게 보이는 문자열은 의도 있을 때만 (l10n 도입 후엔 키로 교체) |
| 5 | 프로덕션 변경 시 테스트 동반 | `src/` 변경 있는데 `*.test.*` 변경 0건이면 차단 |
| 6 | lint + typecheck + test + build 통과 | `npm run lint && npm run typecheck && npm test && npm run build` |

## 경고 항목 (차단은 안 하지만 기록)

| # | 항목 |
|---|------|
| 7 | 커밋 메시지 형식 (`{이모지} [{type}] {요약}`) 불일치 |
| 8 | WIP/임시 커밋 (`WIP`, `fixme`, `임시`, `asdf`) |
| 9 | `.ait` 파일 100MB 초과 (배포 직전에 별도 체크) |

## 실행 순서 (수동 점검)

### 1. 브랜치 확인
```bash
git rev-parse --abbrev-ref HEAD
# main이면 즉시 중단. feature/* 또는 develop 사용
```

### 2. Secrets 점검
```bash
git status --porcelain | grep -E '\.env(\.local)?$'
# 결과가 있으면 즉시 unstage. .gitignore에 포함되어 있어야 함

git diff --cached | grep -iE 'sk_live|api[_-]?key=|secret_key=|password='
# 출력 있으면 검토. 진짜 시크릿이면 unstage 후 .env로 이동
```

### 3. console / debugger 점검
```bash
git diff --cached --name-only | grep -E '\.(ts|tsx)$' | \
  xargs grep -nE 'console\.(log|debug)|debugger' 2>/dev/null
```
발견 시 제거 또는 `console.warn`/`console.error`로 (의도적 경고/에러만).

### 4. 한글 하드코딩 점검 (l10n 도입 후 강제)
```bash
git diff --cached --name-only | grep -E 'src/.+\.(ts|tsx)$' | \
  xargs grep -nE '"[가-힣]+"|'\''[가-힣]+'\''' 2>/dev/null
```
사용자에게 보이는 문자열이면 l10n 키로 이동. 시스템 메시지(에러 throw 등)는 예외.

### 5. 테스트 동반 확인
```bash
src_changed=$(git diff --cached --name-only | grep -E 'src/.+\.(ts|tsx)$' | grep -vE '\.test\.' | wc -l)
tests_changed=$(git diff --cached --name-only | grep -E '\.test\.(ts|tsx)$' | wc -l)
echo "Sources: $src_changed, Tests: $tests_changed"
# Sources 변경이 있는데 Tests 변경 0건이면 차단 대상
# 단 설정/타입 정의/배럴 변경만이면 예외
```

### 6. 빌드 + 테스트
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Phase 4 (GREEN 재검증) 전용 체크

리팩토링 직후 실행. 각 리팩토링 단위마다 이 검증을 돌린다 (전체 완성 후 몰아서 하지 않음):

- [ ] `npm run lint` — clean
- [ ] `npm run typecheck` — clean
- [ ] `npm test` — 전체 녹색
- [ ] (필요 시) `npm run build` — 산출 성공
- [ ] 회귀 0건 (실패 테스트 리스트가 비어있음)
- [ ] 경계면 shape 일치:
  - Hook 시그니처 ↔ 사용처 (Component가 호출하는 함수가 hook이 노출하는가)
  - API 함수 입출력 ↔ Supabase 컬럼 (필드명 오타?)
  - SDK wrapper 시그니처 ↔ `@apps-in-toss/web-framework` 실제 export
  - 라우트 path ↔ `useNavigate` / `<Link>` 호출

실패 시: 방금 리팩토링을 `git restore`로 되돌리고 Phase 3을 더 작게 쪼개 재시도.

## Phase 5 (커밋 전) 전용 체크

- [ ] 위 1~6 전수 통과
- [ ] 커밋 메시지 형식: `{이모지} [{type}] {요약}` (`docs/git/commit.md`)
- [ ] 한 커밋 = 한 사이클 (Phase 1+2+3+4를 한 커밋에)
- [ ] 리팩토링과 기능 추가는 분리 커밋 (refactor 먼저, feat 나중)

## Apps in Toss 배포 직전 추가 체크

콘솔 업로드 전:

- [ ] `granite.config.ts` `appName`/`displayName`/`primaryColor`/`icon` 채워짐
- [ ] `npm run build` 산출 `<appName>.ait` 압축 해제 100MB 이하
- [ ] 샌드박스 앱에서 `intoss://julook-web` 1회 이상 실기기 동작 확인
- [ ] 사용 권한 SDK API → `permissions` 필드에 선언

## 비상 우회 (지양)

정말 불가피할 때만 사용자 명시 승인 하에 `--no-verify` 사용. 우회 시 즉시 후속 커밋에 해결 + 커밋 메시지에 이유 명시.

**왜 지양하는가**: pre-push는 TDD 강제의 마지막 방어선. 우회가 습관이 되면 CI 실패 폭탄이 쌓인다.

## 참조 (프로젝트 문서)

- 푸시 차단 규칙: `docs/git/push-check.md`
- 커밋 규칙: `docs/git/commit.md`
- 자가 강제: `docs/tdd/cycle.md`
- 테스트: `docs/testing/writing.md`
- 코딩 스타일: `docs/coding/style.md`
