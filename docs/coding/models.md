---
참조:
  - ../references/ios-project.md
피참조:
  - ../architecture/structure.md
검증:
  - src/shared/types/
---

# 도메인 모델

## 단일 진실: iOS 프로젝트

도메인 모델(필드 이름, 타입, nullable 여부, 관계)은 **iOS 본앱이 단일 진실**.

- 정의 위치: `/Users/kimsunghun/Desktop/julook/docs/coding/models.md`
- DB 스키마: `/Users/kimsunghun/Desktop/julook/docs/database/schema.md`

Web은 동일한 구조의 TypeScript 타입을 `src/shared/types/`에 둔다.

## 변환 규칙

| Swift | TypeScript |
|-------|-----------|
| `String` | `string` |
| `Int`, `Double` | `number` |
| `Bool` | `boolean` |
| `Date` | `string` (ISO 8601) — 서버에서 string으로 옴 |
| `String?` (Optional) | `string \| null` (DB 컬럼이 nullable이면) 또는 `string \| undefined` |
| `enum` | `as const` 객체 + union |
| `Codable struct` | `interface` 또는 `type` |

## 예시

iOS:
```swift
struct Makgeolli: Codable {
    let id: Int
    let name: String
    let nameEn: String?
    let alcohol: Double
}
```

Web:
```ts
export interface Makgeolli {
  id: number;
  name: string;
  name_en: string | null;  // Supabase 컬럼명 그대로
  alcohol: number;
}
```

## 컬럼명 규칙

- Supabase 컬럼은 `snake_case` (예: `name_en`)
- TS 타입에서 같은 `snake_case` 유지 (변환 레이어 없을 때)
- 컴포넌트에서 사용 시 destructure로 alias 가능

## 동기화 룰

- iOS `models.md` 변경 → Web `src/shared/types/`에 동일 PR로 반영
- DB 컬럼 추가 → 양쪽 모두 PR (한 쪽만 가면 빌드는 통과해도 데이터 일관성 깨짐)
