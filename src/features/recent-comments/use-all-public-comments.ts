import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchAllPublicComments, type RecentCommentItem } from "./api";

export function useAllPublicComments(): UseQueryResult<
  RecentCommentItem[],
  Error
> {
  return useQuery({
    queryKey: ["user-comments", "all-public"] as const,
    queryFn: fetchAllPublicComments,
  });
}
