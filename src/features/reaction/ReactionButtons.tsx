import { useReaction } from "./use-reaction";
import styles from "./ReactionButtons.module.css";

type ReactionButtonsProps = {
  makgeolliId: string;
};

// iOS InformationView+Reaction.swift 미러: 싫어요/좋아요 두 버튼.
// 같은 reaction을 다시 누르면 토글 OFF (delete), 다른 reaction이면 update.
export function ReactionButtons({ makgeolliId }: ReactionButtonsProps) {
  const { userReaction, counts, toggle } = useReaction(makgeolliId);

  return (
    <div data-testid="reaction-buttons" className={styles.row}>
      <button
        type="button"
        className={styles.button}
        aria-pressed={userReaction === "dislike"}
        onClick={() => toggle("dislike")}
      >
        싫어요 ({counts.dislike})
      </button>
      <button
        type="button"
        className={styles.button}
        aria-pressed={userReaction === "like"}
        onClick={() => toggle("like")}
      >
        좋아요 ({counts.like})
      </button>
    </div>
  );
}
