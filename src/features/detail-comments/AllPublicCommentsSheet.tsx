import { Fragment } from "react";
import { PageNav } from "@/shared/ui/PageNav";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useCommentAuthorReactions } from "@/features/reaction";
import { reactionCircleIconSrc } from "@/features/reaction/icon";
import { formatDateMD } from "@/shared/lib/format-date";
import { useDetailComments } from "@/features/detail-comments/use-detail-comments";
import styles from "./AllPublicCommentsSheet.module.css";

type Props = {
  open: boolean;
  makgeolliId: string | undefined;
  onClose: () => void;
};

// iOS AllCommentsSheetView 1:1 미러 — Detail 페이지 EvaluationSection 가로 strip 의
// 카드를 탭하면 등장하는 전체 화면 시트. 공개 코멘트 전체 (created_at desc) 노출.
export function AllPublicCommentsSheet({
  open,
  makgeolliId,
  onClose,
}: Props) {
  if (!open) return null;
  if (makgeolliId == null) return null;

  return (
    <SheetBody makgeolliId={makgeolliId} onClose={onClose} />
  );
}

// open=false 일 때 hook 자체가 호출되지 않도록 분리 — `renders null when open is false` 의도.
function SheetBody({
  makgeolliId,
  onClose,
}: {
  makgeolliId: string;
  onClose: () => void;
}) {
  const { data, isLoading, isError, refetch } = useDetailComments(makgeolliId);
  const { data: reactions } = useCommentAuthorReactions(data);

  return (
    <div role="dialog" aria-modal="true" className={styles.sheet}>
      <div className={styles.navBar}>
        <PageNav title="코멘트" onClose={onClose} />
      </div>
      <div className={styles.body}>
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : !data || data.length === 0 ? (
          <EmptyState message="공개된 코멘트가 없어요" />
        ) : (
          <div className={styles.list}>
            {data.map((c, idx) => {
              const reactionType = reactions?.get(c.id) ?? null;
              return (
                <Fragment key={c.id}>
                  <article
                    data-testid="all-public-comment-item"
                    className={styles.item}
                  >
                    <div className={styles.itemHeader}>
                      <img
                        data-testid="all-public-comment-reaction-icon"
                        className={styles.reactionIcon}
                        src={reactionCircleIconSrc(reactionType)}
                        alt=""
                      />
                      <span className={styles.date}>
                        {formatDateMD(c.created_at)}
                      </span>
                    </div>
                    <p className={styles.comment}>{c.comment}</p>
                  </article>
                  {idx !== data.length - 1 && (
                    <div
                      data-testid="all-public-comment-divider"
                      className={styles.divider}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
