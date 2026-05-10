import { useEffect, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getOrCreateUserId } from "@/shared/lib/identity";
import type { ReactionType } from "@/shared/types";
import { fetchMyReactionMakgeollis, type MyReactionItem } from "./api";

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
