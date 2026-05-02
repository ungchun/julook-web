import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Award } from "@/shared/types";
import { fetchAwards } from "./api";

export function useAwards(): UseQueryResult<Award[], Error> {
  return useQuery({
    queryKey: ["awards"] as const,
    queryFn: fetchAwards,
  });
}
