import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { getMakgeolliImageUrl } from "@/shared/lib/makgeolli-image";
import { formatDateYMD } from "@/shared/lib/format-date";
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
      <div className={styles.titleRow}>
        <h2 className={styles.title}>코멘트가 달렸어요</h2>
        <img
          className={styles.titleArrow}
          src="/assets/arrow/right.svg"
          alt=""
        />
      </div>
      <div className={styles.list}>
        {data.map((item, idx) => {
          const imageUrl = getMakgeolliImageUrl(item.makgeolli.image_name);
          return (
            <Fragment key={item.comment.id}>
              <div
                className={styles.row}
                onClick={() => navigate(`/makgeolli/${item.makgeolli.id}`)}
              >
                <div className={styles.imageBox}>
                  {imageUrl && (
                    <img
                      className={styles.image}
                      src={imageUrl}
                      alt={item.makgeolli.name}
                    />
                  )}
                </div>
                <div className={styles.body}>
                  <span className={styles.makgeolliName}>
                    {item.makgeolli.name}
                  </span>
                  <p className={styles.comment}>{item.comment.comment}</p>
                  <span className={styles.date}>
                    {formatDateYMD(item.comment.created_at)}
                  </span>
                </div>
              </div>
              {idx !== data.length - 1 && <div className={styles.divider} />}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
