import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useUserId } from "@/shared/lib/use-user-id";
import type { ReactionType } from "@/shared/types";
import { fetchMyReactionMakgeollis, type MyReactionItem } from "./api";

export function useMyReactionActivity(
  reactionType: ReactionType,
): UseQueryResult<MyReactionItem[], Error> {
  const userId = useUserId();
  return useQuery({
    queryKey: ["my-activity", "reaction", reactionType, userId] as const,
    queryFn: () => fetchMyReactionMakgeollis(userId!, reactionType),
    enabled: !!userId,
  });
}
