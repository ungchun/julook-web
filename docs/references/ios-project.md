---
참조:
  - ../coding/models.md
  - ../services/supabase.md
피참조:
  - ../../CLAUDE.md
검증: []
---

# iOS 본앱 참조 맵

이 프로젝트(`julook-web`)는 iOS 본앱(`julook`)의 **확장**이다.
도메인/스키마/브랜드는 iOS가 단일 진실. Web은 그 위에 Apps in Toss용 UI를 얹는다.

## 본앱 위치

`/Users/kimsunghun/Desktop/julook/`

## "이럴 땐 저기를 봐라" 표

| 작업 상황 | iOS 프로젝트에서 볼 곳 |
|-----------|------------------------|
| 새 화면 만들 때 (UX 흐름) | `Projects/Feature/` 하위 Scene 폴더 (예: `MakgeolliDetail/`) |
| 도메인 모델 필드 정의 | `docs/coding/models.md` + `Projects/Domain/Sources/Models/` |
| Supabase 테이블 컬럼 | `docs/database/schema.md` |
| Supabase 호출 함수 패턴 | `docs/services/supabase.md` + `Projects/Data/` |
| RLS / 권한 / 인증 흐름 | `docs/services/supabase.md` |
| 로컬라이제이션 키 | `docs/coding/localization.md` + `Resources/*.strings` |
| 브랜드 색상/폰트/아이콘 | `docs/ui/design-system.md` + `Projects/DesignSystem/` |
| 막걸리 카드 디자인 의도 | `Projects/Feature/Home/.../Components/MakgeolliCard.swift` |
| 검색 동작/필터 의도 | `Projects/Feature/Search/` |
| 평점·리뷰 비즈니스 룰 | `Projects/Feature/Review/` + `docs/database/schema.md` (테이블) |
| 커밋 메시지 형식 | `docs/git/commit.md` |
| pre-push 체크리스트 | `docs/git/push-check.md` |
| TDD Phase 정의 (원본) | `docs/tdd/phases.md` |

## 동기화 의무

다음 변경은 **iOS와 Web을 같은 PR**로 처리:

- DB 컬럼 추가/삭제/타입 변경
- 도메인 모델 필드 추가/삭제
- 로컬라이제이션 키 추가/이름 변경
- 브랜드 색상/아이콘 변경

한쪽만 가면 데이터 일관성/사용자 경험이 깨진다.

## 동기화 안 해도 되는 것

- UI 레이아웃/애니메이션 (스택이 다르므로 자연히 차이)
- 컴포넌트 분해 방식
- 라우팅/네비게이션 구조
- 테스트 도구(TestStore vs Vitest)

## Claude Code 활용 팁

`julook-web`에서 작업 중 iOS 본앱 정보가 필요하면:

```
/Users/kimsunghun/Desktop/julook/docs/...
/Users/kimsunghun/Desktop/julook/Projects/Domain/Sources/Models/...
```
경로를 직접 Read 하면 된다. 두 프로젝트가 같은 사용자 데스크탑에 있으므로 import는 못 해도 **참조는 자유**.

## 두 스킬의 분리

각 스킬은 **프로젝트 폴더 안에서만** 동작한다 (project-scoped):

| 스킬 | 위치 | 동작 영역 |
|------|------|-----------|
| `/julook` | `/Users/kimsunghun/Desktop/julook/.claude/skills/julook/` | iOS 본앱 (Swift/TCA/Tuist/xcodebuild) |
| `/julook-web` | `/Users/kimsunghun/Desktop/julook-web/.claude/skills/julook-web/` | Web 미니앱 (Vite/React/Vitest/Apps in Toss) |

같은 5인 팀 구조(orchestrator, analyst, test-author, implementer, verifier)지만 검증 명령과 도메인 문법이 다르다. **현재 폴더에 맞는 스킬만 자동 트리거**되므로 혼동 없음.
