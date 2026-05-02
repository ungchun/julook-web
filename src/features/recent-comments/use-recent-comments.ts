import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchRecentComments, type RecentCommentItem } from "./api";

export function useRecentComments(): UseQueryResult<
  RecentCommentItem[],
  Error
> {
  return useQuery({
    queryKey: ["user-comments", "recent"] as const,
    queryFn: fetchRecentComments,
  });
}
