import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Award } from "@/shared/types";
import { fetchAwardById } from "./api";

export function useAward(
  id: string | undefined,
): UseQueryResult<Award | null, Error> {
  return useQuery({
    queryKey: ["awards", "by-id", id] as const,
    queryFn: () => fetchAwardById(id!),
    enabled: !!id,
  });
}
