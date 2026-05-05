import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { UserComment } from "@/shared/types";
import { fetchDetailComments } from "./api";

// makgeolliId가 없으면 비활성 — useMakgeolli 패턴 미러.
export function useDetailComments(
  makgeolliId: string | undefined,
): UseQueryResult<UserComment[], Error> {
  return useQuery({
    queryKey: ["user-comments", "by-makgeolli", makgeolliId] as const,
    queryFn: () => fetchDetailComments(makgeolliId!),
    enabled: !!makgeolliId,
  });
}
