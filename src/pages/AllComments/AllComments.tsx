import { Fragment, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CommentRow } from "@/shared/ui/CommentRow";
import { useCommentAuthorReactions } from "@/features/reaction";
import { useInfinitePublicComments } from "@/features/recent-comments";
import { PageNav } from "@/shared/ui/PageNav";
import { CommentRowSkeleton } from "@/shared/ui/CommentRowSkeleton";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { InfiniteListSentinel } from "@/shared/ui/InfiniteListSentinel";
import styles from "./AllComments.module.css";

// /comments/all — 전 막걸리 대상 공개 코멘트 페이지.
// iOS CommentListView 미러. pageSize 10 서버 페이지네이션 (getRecentCommentsPaginated).
export function AllComments() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfinitePublicComments();
  const navigate = useNavigate();

  const items = useMemo(() => (data?.pages ?? []).flat(), [data]);
  const { data: reactions } = useCommentAuthorReactions(
    items.map((item) => item.comment),
  );

  const onSentinel = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <main
      className={styles.main}
      style={{
        paddingTop: 16,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
      }}
    >
      <PageNav onClose={() => navigate(-1)} title="코멘트가 달렸어요" />

      {isLoading && <CommentRowSkeleton count={5} />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isError && !isLoading && items.length === 0 && (
        <EmptyState message="공개된 코멘트가 없어요" />
      )}
      {items.length > 0 && (
        <div className={styles.list}>
          {items.map((item, idx) => (
            <Fragment key={item.comment.id}>
              <CommentRow
                comment={item.comment}
                makgeolli={item.makgeolli}
                onClick={() => navigate(`/makgeolli/${item.makgeolli.id}`)}
                testId="all-comments-row"
                reactionType={reactions?.get(item.comment.id) ?? null}
              />
              {idx !== items.length - 1 && (
                <div className={styles.divider} />
              )}
            </Fragment>
          ))}
        </div>
      )}
      {hasNextPage && <InfiniteListSentinel onIntersect={onSentinel} />}
      {isFetchingNextPage && <LoadingState />}
    </main>
  );
}
