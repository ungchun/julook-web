# Julook Web

주룩(Julook) 막걸리 정보 서비스의 **앱인토스(Apps in Toss) 미니앱 버전**.
스택: Vite + React 19 + TypeScript + `@apps-in-toss/web-framework` (Granite 런타임).

## 🔴 최우선 규칙: TDD Cycle

**단 한 줄의 프로덕션 코드도 실패하는 테스트 없이 수정/추가 금지.**

모든 작업은 `red → green → refactor → green` 사이클을 따른다. iOS 본앱과 동일한 철학.

- 사이클 정의: [docs/tdd/cycle.md](./docs/tdd/cycle.md)
- Phase 게이트: [docs/tdd/phases.md](./docs/tdd/phases.md)

## 🎯 이 프로젝트의 정체

- **본앱**: iOS 네이티브 (Swift 6.0 + SwiftUI + TCA) — `/Users/kimsunghun/Desktop/julook/`
- **이 프로젝트**: 앱인토스 미니앱용 **Web 클라이언트** (이미지 중심 막걸리 탐색 UX)
- **공유 자산**: Supabase DB / 도메인 모델 / 브랜드 정체성 — 본앱 문서를 단일 진실로 참조
- **고유 자산**: Apps in Toss SDK 연동 / Web UI 패턴 / Vitest 테스트

## 📚 본앱(iOS) 문서 참조 규칙

다음 영역은 **iOS 프로젝트 문서가 단일 진실(Source of Truth)**. Web에서 재정의하지 않는다.

| 영역 | 참조 경로 (iOS) |
|------|-----------------|
| DB 스키마 | `/Users/kimsunghun/Desktop/julook/docs/database/schema.md` |
| 도메인 모델 의도 | `/Users/kimsunghun/Desktop/julook/docs/coding/models.md` |
| Supabase 사용 규약 | `/Users/kimsunghun/Desktop/julook/docs/services/supabase.md` |
| 로컬라이제이션 키 | `/Users/kimsunghun/Desktop/julook/docs/coding/localization.md` |
| 커밋 규칙 | `/Users/kimsunghun/Desktop/julook/docs/git/commit.md` |
| pre-push 체크 | `/Users/kimsunghun/Desktop/julook/docs/git/push-check.md` |

전체 매핑: [docs/references/ios-project.md](./docs/references/ios-project.md)

## 🛠️ 작업 유형별 진입점

| 유형 | 문서 |
|------|------|
| 새 기능 추가 | [docs/workflow/feature.md](./docs/workflow/feature.md) |
| 리팩토링 | [docs/workflow/refactor.md](./docs/workflow/refactor.md) |
| 버그 수정 | [docs/workflow/bugfix.md](./docs/workflow/bugfix.md) |

## 🧱 영역별 참조 문서

- **아키텍처**: [structure](./docs/architecture/structure.md), [data-flow](./docs/architecture/data-flow.md)
- **코딩 규칙**: [style](./docs/coding/style.md), [models](./docs/coding/models.md)
- **서비스**: [supabase](./docs/services/supabase.md), [apps-in-toss](./docs/services/apps-in-toss.md)
- **테스트**: [writing](./docs/testing/writing.md)
- **Git**: [commit](./docs/git/commit.md), [push-check](./docs/git/push-check.md)

## ⚠️ `/julook` 스킬 사용 금지

`/julook` 스킬은 **iOS 전용**(TCA TestStore / Tuist / xcodebuild에 하드코딩됨).
이 프로젝트에서 `/julook` 호출 금지. TDD는 본 CLAUDE.md + `docs/tdd/` 가이드를 직접 따른다.

> Web용 별도 스킬(`/julook-web`)은 추후 도입 검토. 현재는 직접 Phase 0~5 게이트를 수동 강제한다.

## 🔌 Apps in Toss 빌드/배포 메모

- 번들 산출물: `<appName>.ait` (`npm run build`로 생성)
- 압축 해제 기준 **100MB 이하** 제한
- 심사: 콘솔 → 검토 요청 (영업일 최대 3일, 운영·디자인·기능·보안 4단계)
- 자세한 SDK API는 [.cursor/skills/apps-in-toss.md](./.cursor/skills/apps-in-toss.md) (CLI가 자동 생성)

## 📝 문서 규약 (iOS와 동일)

- `.md` 상단에 YAML frontmatter: `참조:`, `피참조:`, `검증:`
- 한 문서 150줄 이내, 초과 시 분해
- 규칙엔 "왜"를 함께 적어 엣지케이스 판단 근거 제공
