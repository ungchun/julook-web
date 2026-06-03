import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserId } from "@/shared/lib/use-user-id";
import { invalidateMyActivityCaches } from "@/features/my-activity/lib/invalidate-my-activity-caches";
import type { ReactionType } from "@/shared/types";
import {
  fetchUserReaction,
  fetchReactionCounts,
  saveReaction,
  deleteReaction,
} from "./api";

type UseReactionResult = {
  userReaction: ReactionType | null | undefined;
  counts: { like: number; dislike: number };
  toggle: (type: ReactionType) => void;
};

export function useReaction(makgeolliId: string): UseReactionResult {
  const userId = useUserId();
  const queryClient = useQueryClient();

  const userReactionQuery = useQuery({
    queryKey: ["reaction", "user", userId, makgeolliId] as const,
    queryFn: () => fetchUserReaction(userId!, makgeolliId),
    enabled: !!userId,
  });

  const countsQuery = useQuery({
    queryKey: ["reaction", "counts", makgeolliId] as const,
    queryFn: () => fetchReactionCounts(makgeolliId),
  });

  const toggleMutation = useMutation({
    mutationFn: async (type: ReactionType) => {
      if (!userId) throw new Error("userId not loaded");
      const current = userReactionQuery.data;
      if (current === type) {
        await deleteReaction(userId, makgeolliId);
      } else {
        await saveReaction(userId, makgeolliId, type);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reaction", "user", userId, makgeolliId],
      });
      queryClient.invalidateQueries({
        queryKey: ["reaction", "counts", makgeolliId],
      });
      // iOS InformationCore+Effects.swift:78-90 의 .reactionSaved → refreshMyMakgeollis 미러.
      invalidateMyActivityCaches(queryClient);
    },
  });

  return {
    userReaction: userReactionQuery.data,
    counts: {
      like: countsQuery.data?.like_count ?? 0,
      dislike: countsQuery.data?.dislike_count ?? 0,
    },
    toggle: (type) => toggleMutation.mutate(type),
  };
}
