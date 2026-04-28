---
참조: []
피참조:
  - ../../CLAUDE.md
검증:
  - .git/hooks/commit-msg (있다면)
---

# 커밋 메시지 규약

iOS 본앱과 동일 형식 사용.

## 형식

```
{이모지} [{type}] {요약}
```

예시:
```
✨ [feat] 막걸리 상세 페이지 리뷰 섹션 추가
🐛 [fix] 검색 필터 빈 결과 표시 깨짐 수정
🎨 [style] MakgeolliCard 패딩 통일
🙈 [chore] .env.local .gitignore에 추가
♻️ [refactor] supabase 클라이언트 wrapper 분리
✅ [test] useMakgeolliList 캐시 무효화 테스트
📝 [docs] 데이터 플로우 다이어그램 보강
```

## type 목록

| type | 이모지 | 의미 |
|------|--------|------|
| feat | ✨ | 새 기능 |
| fix | 🐛 | 버그 수정 |
| refactor | ♻️ | 동작 변경 없는 구조 개선 |
| style | 🎨 | 포맷/네이밍/시각만 |
| test | ✅ | 테스트 추가/수정 |
| docs | 📝 | 문서만 |
| chore | 🙈 | 설정/의존성/CI |
| perf | ⚡️ | 성능 개선 |

## 본문 규칙

- 제목 50자 이내, 본문 한 줄당 72자 권장
- "왜"를 적을 것. "무엇"은 diff가 말함
- 여러 변경이 한 커밋에 섞이면 분할

## 단일 진실

상세는 iOS 본앱 문서 참고:
`/Users/kimsunghun/Desktop/julook/docs/git/commit.md`
