// (userId, makgeolliId) 쌍의 내 코멘트 1건을 가리키는 React Query key.
// use-my-comment / use-save-my-comment / use-delete-my-comment 셋이 같은 cache 슬롯을
// 공유하므로 한 곳에서 생성해 오타·드리프트를 방지한다.
//
// readonly tuple 로 반환해 useQuery / setQueryData 의 key 타입 추론을 보존.
export function myCommentByMakgeolliKey(
  userId: string | undefined,
  makgeolliId: string | undefined,
) {
  return ["my-comment", "by-makgeolli", userId, makgeolliId] as const;
}
