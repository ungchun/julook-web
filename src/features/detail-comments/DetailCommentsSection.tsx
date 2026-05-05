import { Fragment } from "react";
import { useDetailComments } from "./use-detail-comments";
import styles from "./DetailCommentsSection.module.css";

type Props = {
  makgeolliId: string | undefined;
};

// iOS Common.Format.dateYMD = "yyyy년 M월 d일" 미러 (recent-comments와 동일).
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 상세 페이지 하단 공개 코멘트 섹션. iOS InformationView+Evaluation.publicCommentsStrip /
// AllCommentsSheetView 의 단순화 버전 — 본문 + 작성일만 노출.
// 작성자 reaction circle은 후속 사이클(요구사항 비범위).
export function DetailCommentsSection({ makgeolliId }: Props) {
  const { data } = useDetailComments(makgeolliId);

  if (!data || data.length === 0) return null;

  return (
    <section data-testid="detail-comments" className={styles.section}>
      <h2 className={styles.title}>코멘트</h2>
      <div className={styles.list}>
        {data.map((c, idx) => (
          <Fragment key={c.id}>
            <article data-testid="detail-comment-item" className={styles.item}>
              <p className={styles.comment}>{c.comment}</p>
              <span className={styles.date}>{formatDate(c.created_at)}</span>
            </article>
            {idx !== data.length - 1 && <div className={styles.divider} />}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
