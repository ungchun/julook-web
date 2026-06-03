import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ReactionType } from "@/shared/types";
import { fetchUserReaction } from "./api";

export type CommentAuthorReactionMap = Map<string, ReactionType | null>;

type CommentRef = {
  id: string;
  user_id: string;
  makgeolli_id: string;
};

// iOS InformationCore+Effects.loadUserReactionsEffect 미러 — 각 (userId, makgeolliId)
// 페어를 병렬 fetch 하고 개별 실패는 null 로 흡수. RecentCommentsSection / AllComments /
// EvaluationSection / AllPublicCommentsSheet 의 작성자 reaction circle 표시용.
export function useCommentAuthorReactions(
  comments: ReadonlyArray<CommentRef> | undefined,
): UseQueryResult<CommentAuthorReactionMap, Error> {
  const enabled = comments != null && comments.length > 0;
  const keyHash = comments
    ? comments
        .map((c) => c.id)
        .slice()
        .sort()
        .join(",")
    : "";

  return useQuery({
    queryKey: ["reaction", "by-comments", keyHash] as const,
    enabled,
    queryFn: async () => {
      const list = comments ?? [];
      const settled = await Promise.allSettled(
        list.map((c) => fetchUserReaction(c.user_id, c.makgeolli_id)),
      );
      const map: CommentAuthorReactionMap = new Map();
      list.forEach((c, idx) => {
        const result = settled[idx];
        if (result.status === "fulfilled") {
          map.set(c.id, result.value);
        } else {
          map.set(c.id, null);
        }
      });
      return map;
    },
  });
}
