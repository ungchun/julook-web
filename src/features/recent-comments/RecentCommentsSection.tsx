import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { CommentRow } from "@/shared/ui/CommentRow";
import { useRecentComments } from "./use-recent-comments";
import styles from "./RecentCommentsSection.module.css";

// iOS RecentCommentsView 미러 — "코멘트가 달렸어요 >" + 최근 공개 코멘트 4개.
// 작성자 reaction circle, 코멘트 페이지 진입은 후속 사이클(E3·E4).
export function RecentCommentsSection() {
  const { data } = useRecentComments();
  const navigate = useNavigate();

  if (!data || data.length === 0) return null;

  return (
    <section data-testid="recent-comments-section" className={styles.section}>
      <button
        type="button"
        className={styles.titleRow}
        onClick={() => navigate("/comments/all")}
      >
        <h2 className={styles.title}>코멘트가 달렸어요</h2>
        <img
          className={styles.titleArrow}
          src="/assets/arrow/right.svg"
          alt=""
        />
      </button>
      <div className={styles.list}>
        {data.map((item, idx) => (
          <Fragment key={item.comment.id}>
            <CommentRow
              comment={item.comment}
              makgeolli={item.makgeolli}
              onClick={() => navigate(`/makgeolli/${item.makgeolli.id}`)}
              preview
            />
            {idx !== data.length - 1 && <div className={styles.divider} />}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
