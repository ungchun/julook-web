import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Makgeolli } from "@/shared/types";
import { fetchMakgeolliById } from "./api";

// id가 없으면 fetch 비활성화 — 라우트 매처가 보장하지만 방어적 처리.
export function useMakgeolli(
  id: string | undefined,
): UseQueryResult<Makgeolli | null, Error> {
  return useQuery({
    queryKey: ["makgeolli", "by-id", id] as const,
    queryFn: () => fetchMakgeolliById(id!),
    enabled: !!id,
  });
}
