import type { Makgeolli, ReactionType, UserComment } from "@/shared/types";
import { getMakgeolliImageUrl } from "@/shared/lib/makgeolli-image";
import { formatDateYMD } from "@/shared/lib/format-date";
import styles from "./CommentRow.module.css";

type Props = {
  comment: UserComment;
  makgeolli: Makgeolli;
  onClick: () => void;
  /** true 면 본문을 2줄 ellipsis 로 자른다 (홈 미리보기). 기본 false (전체 노출). */
  preview?: boolean;
  /** 호출자가 testid 를 지정할 수 있도록 — 예: AllComments 의 "all-comments-row" */
  testId?: string;
  /** 작성자 reaction. undefined → 아이콘 미표시, null → circle_none, 'like'/'dislike' → 해당 아이콘. */
  reactionType?: ReactionType | null;
};

function reactionIconSrc(type: ReactionType | null): string {
  if (type === "like") return "/assets/reaction/circle_like.svg";
  if (type === "dislike") return "/assets/reaction/circle_dislike.svg";
  return "/assets/reaction/circle_none.svg";
}

// RecentCommentsSection / AllComments 공통 row.
// 단일 막걸리 페이지의 DetailCommentsSection 은 다른 구조라 흡수 안 함.
export function CommentRow({
  comment,
  makgeolli,
  onClick,
  preview,
  testId,
  reactionType,
}: Props) {
  const imageUrl = getMakgeolliImageUrl(makgeolli.image_name);

  return (
    <div
      data-testid={testId}
      className={styles.row}
      onClick={onClick}
    >
      <div className={styles.imageBox}>
        {imageUrl && (
          <img className={styles.image} src={imageUrl} alt={makgeolli.name} />
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.nameRow}>
          <span className={styles.makgeolliName}>{makgeolli.name}</span>
          {reactionType !== undefined && (
            <img
              data-testid="comment-author-reaction"
              className={styles.reactionIcon}
              src={reactionIconSrc(reactionType)}
              alt=""
            />
          )}
        </div>
        <p className={preview ? styles.commentPreview : styles.comment}>
          {comment.comment}
        </p>
        <span className={styles.date}>{formatDateYMD(comment.created_at)}</span>
      </div>
    </div>
  );
}
