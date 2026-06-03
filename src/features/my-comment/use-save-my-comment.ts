import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserId } from "@/shared/lib/use-user-id";
import { upsertMyComment } from "@/shared/lib/user-comments";
import { invalidateCommentCaches } from "./lib/invalidate-comment-caches";

type SaveInput = { comment: string; isPublic: boolean };

type UseSaveMyCommentResult = {
  save: (input: SaveInput) => Promise<void>;
  isPending: boolean;
  error: Error | null;
};

export function useSaveMyComment(makgeolliId: string): UseSaveMyCommentResult {
  const userId = useUserId();
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, SaveInput>({
    mutationFn: async (input) => {
      if (!userId) throw new Error("userId not loaded");
      await upsertMyComment({
        userId,
        makgeolliId,
        comment: input.comment,
        isPublic: input.isPublic,
      });
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
