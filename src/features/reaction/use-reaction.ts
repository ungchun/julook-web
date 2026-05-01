import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrCreateUserId } from "@/shared/lib/identity";
import type { ReactionType } from "@/shared/types";
import {
  fetchUserReaction,
  fetchReactionCounts,
  saveReaction,
  deleteReaction,
} from "./api";

// userId는 디바이스 단위이므로 한 번 로드 후 메모리 캐시.
function useUserId(): string | undefined {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    getOrCreateUserId().then((id) => {
      if (alive) setUserId(id);
    });
    return () => {
      alive = false;
    };
  }, []);
  return userId;
}

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
