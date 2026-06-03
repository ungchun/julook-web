import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useUserId } from "@/shared/lib/use-user-id";
import { fetchMyComment } from "@/shared/lib/user-comments";
import type { UserComment } from "@/shared/types/user-comment";

// (userId, makgeolliId) 쌍의 내 코멘트 1건 또는 null.
// userId 비동기 로드 + makgeolliId 옵셔널 가드 → enabled.
export function useMyComment(
  makgeolliId: string | undefined,
): UseQueryResult<UserComment | null, Error> {
  const userId = useUserId();
  return useQuery({
    queryKey: ["my-comment", "by-makgeolli", userId, makgeolliId] as const,
    queryFn: () => fetchMyComment(userId!, makgeolliId!),
    enabled: !!userId && !!makgeolliId,
  });
}
