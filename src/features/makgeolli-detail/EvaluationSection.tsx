import { useReaction } from "@/features/reaction/use-reaction";
import { useCommentAuthorReactions } from "@/features/reaction";
import { reactionCircleIconSrc } from "@/features/reaction/icon";
import { useDetailComments } from "@/features/detail-comments/use-detail-comments";
import { formatDateMD } from "@/shared/lib/format-date";
import styles from "./EvaluationSection.module.css";

type Props = {
  makgeolliId: string;
};

const MAX_COMMENTS_DISPLAY = 5;

// iOS InformationView+Evaluation.MakgeolliEvaluationAndCommentsSection 1:1 미러.
// 타이틀(SF20B) + reaction ratio bar(좋았어요/아쉬워요 비율) + 가로 스크롤 공개 코멘트 카드(prefix 5).
export function EvaluationSection({ makgeolliId }: Props) {
  const { counts } = useReaction(makgeolliId);
  const { data: comments } = useDetailComments(makgeolliId);
  const { data: reactions } = useCommentAuthorReactions(comments);

  const total = counts.like + counts.dislike;
  const hasData = total > 0;
  const likePct = hasData ? Math.round((counts.like / total) * 100) : 0;
  const dislikePct = hasData ? 100 - likePct : 0;

  const displayed = (comments ?? []).slice(0, MAX_COMMENTS_DISPLAY);

  return (
    <section
      data-testid="evaluation-section"
      className={styles.section}
    >
      <h2 className={styles.title}>평가 및 코멘트</h2>

      <div className={styles.barRow}>
        <span className={styles.pctText}>
          {hasData ? `${likePct}%` : "- %"}
        </span>
        <div className={styles.barWrap}>
          {hasData ? (
            <div
              className={styles.barFill}
              style={{
                background: `linear-gradient(to right, var(--color-golden-yellow) 0%, var(--color-golden-yellow) ${likePct}%, var(--color-lilac) ${likePct}%, var(--color-lilac) 100%)`,
              }}
            />
          ) : (
            <div className={styles.barEmpty} />
          )}
        </div>
        <span className={styles.pctText}>
          {hasData ? `${dislikePct}%` : "- %"}
        </span>
      </div>

      {hasData && (
        <div className={styles.countRow}>
          <span className={styles.countText}>좋았어요 ({counts.like})</span>
          <span className={styles.countText}>아쉬워요 ({counts.dislike})</span>
        </div>
      )}

      {displayed.length > 0 ? (
        <div className={styles.strip}>
          {displayed.map((c) => {
            const reactionType = reactions?.get(c.id) ?? null;
            return (
              <article
                key={c.id}
                data-testid="evaluation-comment-card"
                className={styles.card}
              >
                <img
                  className={styles.cardReactionIcon}
                  src={reactionCircleIconSrc(reactionType)}
                  alt=""
                />
                <p className={styles.cardBody}>{c.comment}</p>
                <span className={styles.cardDate}>
                  {formatDateMD(c.created_at)}
                </span>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyCard}>
          <span className={styles.emptyText}>아직 코멘트가 없어요</span>
        </div>
      )}
    </section>
  );
}
