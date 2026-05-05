import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Makgeolli } from "@/shared/types";
import { fetchMakgeollisByAwardName } from "./api";

export function useMakgeollisByAward(
  name: string | undefined,
): UseQueryResult<Makgeolli[], Error> {
  return useQuery({
    queryKey: ["makgeolli", "by-award", name] as const,
    queryFn: () => fetchMakgeollisByAwardName(name!),
    enabled: !!name,
  });
}
