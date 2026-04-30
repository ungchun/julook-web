import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Makgeolli } from "@/shared/types";
import { fetchNewReleases } from "./api";

export function useNewReleases(): UseQueryResult<Makgeolli[], Error> {
  return useQuery({
    queryKey: ["makgeolli", "new-releases"] as const,
    queryFn: fetchNewReleases,
  });
}
