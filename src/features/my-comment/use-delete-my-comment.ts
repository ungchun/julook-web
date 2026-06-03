import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserId } from "@/shared/lib/use-user-id";
import { deleteMyComment } from "@/shared/lib/user-comments";
import { invalidateCommentCaches } from "./lib/invalidate-comment-caches";

type UseDeleteMyCommentResult = {
  delete: () => Promise<void>;
  isPending: boolean;
  error: Error | null;
};

export function useDeleteMyComment(
  makgeolliId: string,
): UseDeleteMyCommentResult {
  const userId = useUserId();
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!userId) throw new Error("userId not loaded");
      await deleteMyComment(userId, makgeolliId);
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
