import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { CommentRow } from "@/shared/ui/CommentRow";
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
          {data.map((item, idx) => (
            <Fragment key={item.comment.id}>
              <CommentRow
                comment={item.comment}
                makgeolli={item.makgeolli}
                onClick={() => navigate(`/makgeolli/${item.makgeolli.id}`)}
                testId="all-comments-row"
              />
              {idx !== data.length - 1 && (
                <div className={styles.divider} />
              )}
            </Fragment>
          ))}
        </div>
      )}
    </main>
  );
}
