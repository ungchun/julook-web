import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Makgeolli } from "@/shared/types";
import { fetchTopLikedMakgeollis } from "./api";

export function useTopLiked(): UseQueryResult<Makgeolli[], Error> {
  return useQuery({
    queryKey: ["makgeolli", "top-liked"] as const,
    queryFn: fetchTopLikedMakgeollis,
  });
}
