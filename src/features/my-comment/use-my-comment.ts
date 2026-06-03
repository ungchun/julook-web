import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useUserId } from "@/shared/lib/use-user-id";
import { fetchMyComment } from "@/shared/lib/user-comments";
import type { UserComment } from "@/shared/types/user-comment";
import { myCommentByMakgeolliKey } from "./lib/query-keys";

// (userId, makgeolliId) 쌍의 내 코멘트 1건 또는 null.
// userId 비동기 로드 + makgeolliId 옵셔널 가드 → enabled.
//
// userId/makgeolliId 미준비 단계는 "데이터를 아직 모르는 상태" 로
// isLoading/isPending = true 에 통합한다. 호출부(MyCommentSection)가
// LoadingState 를 띄울 수 있게 하여 첫 마운트 빈 CTA 깜빡임을 제거.
// (Phase 0 §수정 #3 옵션 1 — iOS 는 UserDefaults 동기 접근이라 이 단계 자체가 없음)
export function useMyComment(
  makgeolliId: string | undefined,
): UseQueryResult<UserComment | null, Error> {
  const userId = useUserId();
  const query = useQuery({
    queryKey: myCommentByMakgeolliKey(userId, makgeolliId),
    queryFn: () => fetchMyComment(userId!, makgeolliId!),
    enabled: !!userId && !!makgeolliId,
  });

  const isWaitingForInputs = !userId || !makgeolliId;
  return {
    ...query,
    isLoading: isWaitingForInputs || query.isLoading,
    isPending: isWaitingForInputs || query.isPending,
  } as UseQueryResult<UserComment | null, Error>;
}
