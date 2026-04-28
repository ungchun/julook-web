# Julook Web

주룩(Julook) 막걸리 정보 서비스의 **앱인토스(Apps in Toss) 미니앱** 클라이언트.

iOS 본앱: `/Users/kimsunghun/Desktop/julook/`

## 스택

- Vite 6 + React 19 + TypeScript 5.7
- `@apps-in-toss/web-framework` (Granite 런타임)
- React Router 7, TanStack Query 5
- Supabase (iOS와 같은 인스턴스)
- Vitest + React Testing Library

## 시작

```bash
cp .env.example .env.local   # 값 채우기
npm install
npm run dev                   # 토스 샌드박스 앱에서 intoss://julook-web 진입
```

## 명령어

| 명령 | 설명 |
|------|------|
| `npm run dev` | 로컬 개발 서버 (granite + vite) |
| `npm run build` | `dist/` + `<appName>.ait` 산출 |
| `npm run deploy` | 콘솔에 업로드 (검토 요청은 수동) |
| `npm test` | Vitest 1회 실행 |
| `npm run test:watch` | Vitest 워치 모드 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 타입 체크 |

## 규칙

- **TDD 강제**: 실패 테스트 없이 프로덕션 코드 한 줄도 추가/수정 금지 ([CLAUDE.md](./CLAUDE.md))
- **iOS 본앱이 단일 진실**: DB 스키마, 도메인 모델, 브랜드는 iOS를 따름 ([docs/references/ios-project.md](./docs/references/ios-project.md))
- **`/julook` 스킬 사용 금지**: iOS 전용 (TCA/Tuist/xcodebuild 하드코딩)

자세한 가이드: [CLAUDE.md](./CLAUDE.md), [docs/](./docs/)

## 링크

- [앱인토스 콘솔](https://apps-in-toss-console.toss.im/)
- [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/)
- [앱인토스 개발자 커뮤니티](https://techchat-apps-in-toss.toss.im/)
