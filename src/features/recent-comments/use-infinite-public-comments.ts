import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { fetchPublicCommentsPage, type RecentCommentItem } from "./api";

// iOS CommentListCore.pageSize 미러
export const PUBLIC_COMMENTS_PAGE_SIZE = 10;

// iOS CommentListCore loadMoreComments 미러 — 서버 페이지네이션.
// hasMore = lastPage.length === pageSize.
export function useInfinitePublicComments(): UseInfiniteQueryResult<
  InfiniteData<RecentCommentItem[]>,
  Error
> {
  return useInfiniteQuery({
    queryKey: ["user-comments", "all-public-infinite"] as const,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchPublicCommentsPage(PUBLIC_COMMENTS_PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PUBLIC_COMMENTS_PAGE_SIZE) return undefined;
      return allPages.length * PUBLIC_COMMENTS_PAGE_SIZE;
    },
  });
}
