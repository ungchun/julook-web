import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Makgeolli } from "@/shared/types";
import { fetchRandomMakgeollis } from "./api";

export function useRandomMakgeollis(): UseQueryResult<Makgeolli[], Error> {
  return useQuery({
    queryKey: ["makgeolli", "random"] as const,
    queryFn: fetchRandomMakgeollis,
    // 새로고침마다 새 셔플 결과를 원하면 staleTime: 0 (TanStack 기본).
  });
}
