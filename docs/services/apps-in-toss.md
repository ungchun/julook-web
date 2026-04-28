---
참조: []
피참조:
  - ../../CLAUDE.md
  - ../architecture/structure.md
검증:
  - granite.config.ts
  - package.json
---

# Apps in Toss (Web SDK)

## 위치

| 자산 | 경로 |
|------|------|
| SDK 패키지 | `@apps-in-toss/web-framework` |
| 설정 | [`/granite.config.ts`](../../granite.config.ts) |
| CLI 자동 생성 가이드 | [`.cursor/skills/apps-in-toss.md`](../../.cursor/skills/apps-in-toss.md) (대용량) |
| 공식 문서 | https://developers-apps-in-toss.toss.im/ |
| 콘솔 | https://apps-in-toss-console.toss.im/ |

## 런타임 모델

- **Granite**: 토스 앱과 통신하는 공통 런타임 (라우팅, `intoss://` 스킴, 가시성)
- 본 SDK는 Vite 기반 WebView 위에서 동작
- 빌드 산출: `dist/` + `<appName>.ait` (콘솔 업로드용)

## 설정 (`granite.config.ts`)

| 키 | 의미 |
|-----|------|
| `appName` | 미니앱 고유 ID, 스킴 매칭 (`intoss://{appName}`) |
| `brand.displayName` | 사용자에게 보이는 한글 이름 |
| `brand.primaryColor` | 앱 기본 색 |
| `brand.icon` | 아이콘 이미지 URL |
| `web.port` | 로컬 dev 서버 포트 |
| `permissions` | 사용 SDK 권한 선언 |
| `outdir` | 빌드 산출 폴더 |

## 주요 API 카테고리

(상세는 공식 [API 개요](https://developers-apps-in-toss.toss.im/api/overview.html) + `.cursor/skills/apps-in-toss.md` 참고)

| 카테고리 | 메서드 (예) |
|----------|------------|
| 인증 | 토스 간편 로그인 |
| 결제 | 토스페이, IAP (`createOneTimePurchaseOrder`) |
| 사용자 | `getUserKeyForGame()` 등 |
| UX | `requestReview()`, `getServerTime()` |
| 메시지 | 토스 메시지 발송 |
| 포인트 | 토스 포인트 지급 |

## 호출 위치 규약

- SDK import는 **`src/shared/lib/toss.ts`** wrapper에서만
- 컴포넌트/훅에서 직접 import 금지 (모킹 단일 지점 확보)
- 테스트는 `vi.mock('@/shared/lib/toss')`

## 개발 사이클

```bash
npm run dev      # 로컬 + 토스 샌드박스 연동
npm run build    # .ait 산출
npm run deploy   # 콘솔 업로드 (수동 검토 요청 필요)
```

## 제약 (반드시 준수)

| 제약 | 값 |
|------|-----|
| `.ait` 압축 해제 | **100MB 이하** |
| 최초 로딩 | **10초 이내** |
| 인터랙션 반응 | **2초 이내** |
| OS 뒤로가기 제스처 | 사용 금지 |
| 자사 앱/서비스 이탈 유도 | 금지 |
| 인트로/팝업 광고 | 금지 (배너는 상/하단만) |

## 심사 (배포 전)

- 콘솔 → 검토 요청 (영업일 최대 3일)
- 4단계: 운영 / 디자인 / 기능 / 보안
- 동시에 1개 버전만 제출 가능
- 승인 후 콘솔 "출시하기" → 즉시 반영, 롤백 지원

## TDS(토스 디자인 시스템)

- 우리는 **TDS 미사용** (`create-ait-app` 시 `n` 선택)
- 이유: 주룩 브랜드 정체성 유지
- 비게임 RN의 경우 TDS 필수지만, **Web은 TDS 강제 아님** (확인됨)
