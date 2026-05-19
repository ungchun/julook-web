import { Fragment } from "react";
import { formatDateYMD } from "@/shared/lib/format-date";
import { useCommentAuthorReactions } from "@/features/reaction";
import { reactionCircleIconSrc } from "@/features/reaction/icon";
import { CommentRowSkeleton } from "@/shared/ui/CommentRowSkeleton";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useDetailComments } from "./use-detail-comments";
import styles from "./DetailCommentsSection.module.css";

type Props = {
  makgeolliId: string | undefined;
};

// 상세 페이지 하단 공개 코멘트 섹션. iOS InformationView+Evaluation.publicCommentsStrip /
// AllCommentsSheetView 의 단순화 버전 — 본문 + 작성일 + 작성자 reaction circle.
export function DetailCommentsSection({ makgeolliId }: Props) {
  const { data, isLoading } = useDetailComments(makgeolliId);
  const { data: reactions } = useCommentAuthorReactions(data);

  if (makgeolliId == null) return null;
  if (isLoading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>코멘트</h2>
        <CommentRowSkeleton count={3} />
      </section>
    );
  }
  if (!data || data.length === 0) {
    return (
      <section data-testid="detail-comments" className={styles.section}>
        <h2 className={styles.title}>코멘트</h2>
        <EmptyState message="아직 작성된 코멘트가 없어요" />
      </section>
    );
  }

  return (
    <section data-testid="detail-comments" className={styles.section}>
      <h2 className={styles.title}>코멘트</h2>
      <div className={styles.list}>
        {data.map((c, idx) => {
          const reactionType = reactions?.get(c.id) ?? null;
          return (
            <Fragment key={c.id}>
              <article
                data-testid="detail-comment-item"
                className={styles.item}
              >
                <img
                  data-testid="comment-author-reaction"
                  className={styles.reactionIcon}
                  src={reactionCircleIconSrc(reactionType)}
                  alt=""
                />
                <p className={styles.comment}>{c.comment}</p>
                <span className={styles.date}>
                  {formatDateYMD(c.created_at)}
                </span>
              </article>
              {idx !== data.length - 1 && <div className={styles.divider} />}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
