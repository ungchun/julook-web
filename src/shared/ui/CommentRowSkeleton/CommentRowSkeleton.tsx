import styles from "./CommentRowSkeleton.module.css";

type Props = {
  count?: number;
  testId?: string;
};

const DEFAULT_COUNT = 4;

// CommentRow 모양 placeholder — fetch 동안 LoadingState spinner 대신 노출.
// pulse 1.5s 애니메이션으로 로딩 인지 신호.
export function CommentRowSkeleton({ count = DEFAULT_COUNT, testId }: Props) {
  return (
    <div
      data-testid={testId}
      className={styles.container}
      role="status"
      aria-label="로딩 중"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          data-testid="comment-skeleton-row"
          className={styles.row}
        >
          <div className={styles.imageBox} />
          <div className={styles.body}>
            <div className={`${styles.bar} ${styles.barName}`} />
            <div className={`${styles.bar} ${styles.barCommentFull}`} />
            <div className={`${styles.bar} ${styles.barCommentShort}`} />
            <div className={`${styles.bar} ${styles.barDate}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
