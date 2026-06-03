import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { useUserId } from "@/shared/lib/use-user-id";
import { useFavorites } from "@/features/favorites";
import type { ReactionType } from "@/shared/types";

export type MyActivityDecorations = {
  /** 본인 reaction 이 등록된 막걸리 id → reaction_type. */
  reactionByMakgeolliId: ReadonlyMap<string, ReactionType>;
  /** 본인 코멘트(공개·비공개 무관)가 1건 이상 있는 makgeolli id 집합. */
  commentSet: ReadonlySet<string>;
  /** 찜한 makgeolli id 집합 (useFavorites 위임). */
  favoriteSet: ReadonlySet<string>;
};

export type UseMyActivityDecorationsResult = {
  data: MyActivityDecorations | undefined;
  isLoading: boolean;
  isError: boolean;
};

type ReactionRow = { makgeolli_id: string; reaction_type: ReactionType };
type CommentIdRow = { makgeolli_id: string };

// iOS MyMakgeolliCore 의 reaction/comment/favorite 단일 reducer 미러.
// 페이지 단에서 1회 호출, 5탭이 같은 Map/Set 으로 카드 decoration 결정.
// N+1 fetch 회피 — 카드별 useReaction 호출 금지.
export function useMyActivityDecorations(): UseMyActivityDecorationsResult {
  const userId = useUserId();
  const { favorites } = useFavorites();

  const reactionsQuery = useQuery({
    queryKey: ["my-activity-decorations", "reactions", userId],
    queryFn: async (): Promise<ReactionRow[]> => {
      const { data, error } = await supabase
        .from("makgeolli_reactions")
        .select("makgeolli_id, reaction_type")
        .eq("user_id", userId as string);
      if (error) throw error;
      return (data ?? []) as ReactionRow[];
    },
    enabled: userId != null,
  });

  const commentsQuery = useQuery({
    queryKey: ["my-activity-decorations", "comments", userId],
    queryFn: async (): Promise<CommentIdRow[]> => {
      const { data, error } = await supabase
        .from("user_comments")
        .select("makgeolli_id")
        .eq("user_id", userId as string);
      if (error) throw error;
      return (data ?? []) as CommentIdRow[];
    },
    enabled: userId != null,
  });

  const favoriteSet = useMemo(
    () => new Set<string>(favorites),
    [favorites],
  );

  const isError = reactionsQuery.isError || commentsQuery.isError;
  const isLoading =
    !isError &&
    (userId == null ||
      reactionsQuery.data == null ||
      commentsQuery.data == null);

  const data = useMemo<MyActivityDecorations | undefined>(() => {
    if (isError) return undefined;
    if (reactionsQuery.data == null || commentsQuery.data == null) {
      return undefined;
    }
    const reactionByMakgeolliId = new Map<string, ReactionType>();
    for (const row of reactionsQuery.data) {
      reactionByMakgeolliId.set(row.makgeolli_id, row.reaction_type);
    }
    const commentSet = new Set<string>();
    for (const row of commentsQuery.data) {
      commentSet.add(row.makgeolli_id);
    }
    return { reactionByMakgeolliId, commentSet, favoriteSet };
  }, [isError, reactionsQuery.data, commentsQuery.data, favoriteSet]);

  return { data, isLoading, isError };
}
