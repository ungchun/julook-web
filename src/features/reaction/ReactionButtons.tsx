import { useReaction } from "./use-reaction";
import styles from "./ReactionButtons.module.css";

type ReactionButtonsProps = {
  makgeolliId: string;
};

function ThumbUpIcon() {
  return (
    <svg
      className={styles.icon}
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73V10z" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg
      className={styles.icon}
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73V14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
    </svg>
  );
}

// iOS InformationView+Reaction + DesignSystem ReactionButton 미러:
// HStack(spacing 4) { thumb icon + 텍스트(SF17R) }, height 50, cornerRadius 12.
// active dislike → lilac, active like → goldenyellow, disabled → w10/w85.
export function ReactionButtons({ makgeolliId }: ReactionButtonsProps) {
  const { userReaction, toggle } = useReaction(makgeolliId);

  return (
    <div data-testid="reaction-buttons" className={styles.row}>
      <button
        type="button"
        className={`${styles.button} ${styles.dislike}`}
        aria-pressed={userReaction === "dislike"}
        onClick={() => toggle("dislike")}
      >
        <ThumbDownIcon />
        아쉬워요
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.like}`}
        aria-pressed={userReaction === "like"}
        onClick={() => toggle("like")}
      >
        <ThumbUpIcon />
        좋았어요
      </button>
    </div>
  );
}
