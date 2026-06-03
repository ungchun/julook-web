import type { Makgeolli, ReactionType } from "@/shared/types";
import { MakgeolliImage } from "@/shared/ui/MakgeolliImage";
import { reactionCircleIconSrc } from "@/features/reaction";
import styles from "./MyActivityGridCard.module.css";

export type MyActivityGridCardProps = {
  makgeolli: Makgeolli;
  reactionType: ReactionType | null;
  hasComment: boolean;
  isFavorite: boolean;
  onClick?: () => void;
};

// iOS MyMakgeolliGridItem 1:1 미러.
// 카드 단위로 reaction/comment/favorite 3 아이콘을 표시.
// 데이터는 페이지 단의 useMyActivityDecorations 가 props 로 주입 (N+1 회피).
export function MyActivityGridCard({
  makgeolli,
  reactionType,
  hasComment,
  isFavorite,
  onClick,
}: MyActivityGridCardProps) {
  return (
    <button
      type="button"
      data-testid="my-activity-grid-card"
      className={styles.card}
      onClick={onClick}
    >
      <div className={styles.imageBox}>
        <MakgeolliImage
          className={styles.image}
          imageName={makgeolli.image_name}
          alt={makgeolli.name}
        />
      </div>
      <div className={styles.name}>{makgeolli.name}</div>
      <div className={styles.iconRow}>
        <img
          className={styles.icon}
          src={reactionCircleIconSrc(reactionType)}
          alt=""
          data-testid="reaction-icon"
        />
        <img
          className={styles.icon}
          src={commentIconSrc(hasComment)}
          alt=""
          data-testid="comment-icon"
        />
        <img
          className={styles.icon}
          src={favoriteIconSrc(isFavorite)}
          alt=""
          data-testid="favorite-icon"
        />
      </div>
    </button>
  );
}

// iOS MyMakgeolliView+Helpers.swift:82-87 미러.
function commentIconSrc(hasComment: boolean): string {
  return hasComment
    ? "/assets/reaction/comment_fill.svg"
    : "/assets/reaction/comment_none.svg";
}

function favoriteIconSrc(isFavorite: boolean): string {
  return isFavorite
    ? "/assets/reaction/heart_fill.svg"
    : "/assets/reaction/heart_none.svg";
}
