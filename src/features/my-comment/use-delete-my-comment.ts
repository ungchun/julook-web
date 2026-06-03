import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserId } from "@/shared/lib/use-user-id";
import { deleteMyComment } from "@/shared/lib/user-comments";
import type { UserComment } from "@/shared/types/user-comment";
import { invalidateCommentCaches } from "./lib/invalidate-comment-caches";
import { myCommentByMakgeolliKey } from "./lib/query-keys";

type UseDeleteMyCommentResult = {
  delete: () => Promise<void>;
  isPending: boolean;
  error: Error | null;
};

// onMutate 의 ctx. userId 미준비로 낙관 적용을 건너뛴 경우 previous 는 undefined.
type DeleteContext = { previous: UserComment | null | undefined };

export function useDeleteMyComment(
  makgeolliId: string,
): UseDeleteMyCommentResult {
  const userId = useUserId();
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, void, DeleteContext>({
    mutationFn: async () => {
      if (!userId) throw new Error("userId not loaded");
      await deleteMyComment(userId, makgeolliId);
    },
    // 낙관 삭제 — cache 를 즉시 null 로 설정. userId 미준비 시 가드.
    onMutate: async () => {
      if (!userId) return { previous: undefined };
      const queryKey = myCommentByMakgeolliKey(userId, makgeolliId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<UserComment | null>(queryKey);
      queryClient.setQueryData<UserComment | null>(queryKey, null);
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
    delete: () => mutation.mutateAsync(),
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
