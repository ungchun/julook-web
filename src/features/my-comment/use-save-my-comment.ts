import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserId } from "@/shared/lib/use-user-id";
import { upsertMyComment } from "@/shared/lib/user-comments";
import type { UserComment } from "@/shared/types/user-comment";
import { invalidateCommentCaches } from "./lib/invalidate-comment-caches";
import { myCommentByMakgeolliKey } from "./lib/query-keys";

type SaveInput = { comment: string; isPublic: boolean };

type UseSaveMyCommentResult = {
  save: (input: SaveInput) => Promise<void>;
  isPending: boolean;
  error: Error | null;
};

// onMutate 의 ctx 타입. userId 미준비로 낙관 적용을 건너뛴 경우 previous 는 undefined.
type SaveContext = { previous: UserComment | null | undefined };

export function useSaveMyComment(makgeolliId: string): UseSaveMyCommentResult {
  const userId = useUserId();
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, SaveInput, SaveContext>({
    mutationFn: async (input) => {
      if (!userId) throw new Error("userId not loaded");
      await upsertMyComment({
        userId,
        makgeolliId,
        comment: input.comment,
        isPublic: input.isPublic,
      });
    },
    // 낙관 갱신 — userId 미준비 시 cache 키가 불완전해지므로 가드.
    // 이 경우 mutationFn 이 곧 throw → onError 가 진입하지만 ctx.previous 가
    // undefined 라 setQueryData 를 다시 호출하지 않는다 (기존 cache 보존).
    onMutate: async (input) => {
      if (!userId) return { previous: undefined };
      const queryKey = myCommentByMakgeolliKey(userId, makgeolliId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<UserComment | null>(queryKey);
      const now = new Date().toISOString();
      const optimistic: UserComment = {
        id: previous?.id ?? "optimistic",
        user_id: userId,
        makgeolli_id: makgeolliId,
        comment: input.comment,
        is_public: input.isPublic,
        created_at: previous?.created_at ?? now,
        updated_at: now,
      };
      queryClient.setQueryData<UserComment | null>(queryKey, optimistic);
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (!userId || ctx === undefined) return;
      const queryKey = myCommentByMakgeolliKey(userId, makgeolliId);
      queryClient.setQueryData<UserComment | null | undefined>(
        queryKey,
        ctx.previous,
      );
    },
    onSuccess: () => {
      invalidateCommentCaches(queryClient);
    },
  });

  return {
    save: (input) => mutation.mutateAsync(input),
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
