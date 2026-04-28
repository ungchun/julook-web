---
참조:
  - ../../CLAUDE.md
피참조:
  - ../architecture/data-flow.md
검증:
  - src/shared/lib/supabase.ts
---

# Supabase (Web)

## 단일 진실: iOS 프로젝트

API 사용 규약(테이블 권한, RLS 정책, 인증 흐름)은 **iOS 본앱 문서가 단일 진실**:

- `/Users/kimsunghun/Desktop/julook/docs/services/supabase.md`
- `/Users/kimsunghun/Desktop/julook/docs/database/schema.md`

Web은 같은 인스턴스를 공유하므로 정책을 따로 정하지 않는다.

## Web 클라이언트 셋업

```ts
// src/shared/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) throw new Error('Supabase env missing');

export const supabase = createClient(url, anonKey);
```

`.env.local`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

(values는 iOS 프로젝트의 `Secrets.xcconfig` 또는 Supabase 대시보드에서 가져옴.)

## 호출 위치 규약

- supabase 클라이언트는 **`src/features/{feature}/api/`** 안에서만 import
- 컴포넌트/페이지에서 직접 import 금지
- 테스트는 `vi.mock('@/shared/lib/supabase')`로 모킹

## 인증

앱인토스 환경에서는 토스 로그인 SDK가 우선. Supabase Auth는 백엔드 식별자 매핑 용도로만 사용 가능.
구체 흐름은 iOS 본앱 문서 + `services/apps-in-toss.md` 참고.

## 타입 생성

`@supabase/supabase-js` + 타입 자동 생성을 쓰려면:
```bash
npx supabase gen types typescript --project-id <id> > src/shared/types/supabase.ts
```

수동 타입(`models.md`)과 자동 생성 타입은 분리해서 보관. 자동 타입은 raw 컬럼, 수동 타입은 도메인 모델.
