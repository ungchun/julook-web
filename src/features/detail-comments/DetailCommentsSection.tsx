import { Fragment } from "react";
import { formatDateYMD } from "@/shared/lib/format-date";
import { useCommentAuthorReactions } from "@/features/reaction";
import { useDetailComments } from "./use-detail-comments";
import styles from "./DetailCommentsSection.module.css";

type Props = {
  makgeolliId: string | undefined;
};

function reactionIconSrc(type: "like" | "dislike" | null): string {
  if (type === "like") return "/assets/reaction/circle_like.svg";
  if (type === "dislike") return "/assets/reaction/circle_dislike.svg";
  return "/assets/reaction/circle_none.svg";
}

// 상세 페이지 하단 공개 코멘트 섹션. iOS InformationView+Evaluation.publicCommentsStrip /
// AllCommentsSheetView 의 단순화 버전 — 본문 + 작성일 + 작성자 reaction circle.
export function DetailCommentsSection({ makgeolliId }: Props) {
  const { data } = useDetailComments(makgeolliId);
  const { data: reactions } = useCommentAuthorReactions(data);

  if (!data || data.length === 0) return null;

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
                  src={reactionIconSrc(reactionType)}
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
