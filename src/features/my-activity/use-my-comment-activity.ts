import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useUserId } from "@/shared/lib/use-user-id";
import { fetchMyComments, type MyCommentItem } from "./api";

export function useMyCommentActivity(): UseQueryResult<MyCommentItem[], Error> {
  const userId = useUserId();
  return useQuery({
    queryKey: ["my-activity", "comment", userId] as const,
    queryFn: () => fetchMyComments(userId!),
    enabled: !!userId,
  });
}
