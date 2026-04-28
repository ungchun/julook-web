---
참조:
  - commit.md
피참조:
  - ../../CLAUDE.md
검증:
  - .git/hooks/pre-push (있다면)
---

# Push 전 체크리스트 🚫

푸시 전 아래 6개를 직접 확인. CI/훅이 없어도 사람이 강제.

## 1. 브랜치
- `main`/`develop` 직접 푸시 금지 (PR 경유)
- 브랜치명은 `feat/`, `fix/`, `refactor/` 접두

## 2. Secrets
- `.env`, `.env.local` 등 시크릿 파일 트래킹 안 됨 확인
- 코드에 API 키/토큰 하드코딩 없음
```bash
git diff --cached | grep -iE 'sk_live|secret|api[_-]?key' && echo "⚠️ 시크릿 의심" || echo "✓"
```

## 3. console.log / debugger
```bash
git diff --cached -- 'src/**/*.ts' 'src/**/*.tsx' | grep -E '^\+.*(console\.log|debugger)' && echo "⚠️ 잔존 디버그" || echo "✓"
```
의도된 로그는 `console.warn/error` 또는 logger 유틸 사용.

## 4. 한글 하드코딩
- UI 문자열은 l10n 키 (또는 명시 의도일 때 주석)
- 가능하면 `src/locales/`에 키-값으로

## 5. 테스트 동반
- 프로덕션 변경에는 반드시 새/수정 테스트 동반
- `git diff --cached --stat`에 `.test.` 또는 `__tests__` 포함 확인

## 6. 빌드 + 테스트 통과
```bash
npm run lint && npm run build && npm test
```
하나라도 실패하면 푸시 금지.

## Apps in Toss 추가 체크 (배포 직전)

- `granite.config.ts` `appName`/`displayName`/`primaryColor`/`icon` 모두 채워짐
- `npm run build` 산출 `<appName>.ait` 압축 해제 100MB 이하
- 샌드박스 앱에서 1회 이상 실기기 동작 확인

## 단일 진실

iOS 본앱 push-check 원칙과 동일: `/Users/kimsunghun/Desktop/julook/docs/git/push-check.md`
