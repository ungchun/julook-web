import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { getMakgeolliImageUrl } from "@/shared/lib/makgeolli-image";
import { formatDateYMD } from "@/shared/lib/format-date";
import { useAllPublicComments } from "@/features/recent-comments/use-all-public-comments";
import { PageNav } from "@/shared/ui/PageNav";
import styles from "./AllComments.module.css";

// /comments/all — 전 막걸리 대상 공개 코멘트 페이지.
// iOS CommentListView 미러. 1단계: 페이지네이션/reaction circle 보류.
export function AllComments() {
  const { data } = useAllPublicComments();
  const navigate = useNavigate();

  return (
    <main
      className={styles.main}
      style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 60 }}
    >
      <PageNav onClose={() => navigate(-1)} />

      <h1 className={styles.title}>코멘트가 달렸어요</h1>

      {data?.length === 0 && (
        <p className={styles.empty}>공개된 코멘트가 없어요</p>
      )}
      {data != null && data.length > 0 && (
        <div className={styles.list}>
          {data.map((item, idx) => {
            const imageUrl = getMakgeolliImageUrl(item.makgeolli.image_name);
            return (
              <Fragment key={item.comment.id}>
                <div
                  data-testid="all-comments-row"
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
                {idx !== data.length - 1 && (
                  <div className={styles.divider} />
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </main>
  );
}
