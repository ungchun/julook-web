import styles from "./MakgeolliCardSkeleton.module.css";

type Props = {
  count?: number;
  testId?: string;
};

const DEFAULT_COUNT = 5;
const TASTE_COUNT = 4;

// MakgeolliCard(104×240) 동일 사이즈의 placeholder. 가로 carousel 안에서
// NewReleases / RandomMakgeolli 섹션 isLoading 시 사용.
export function MakgeolliCardSkeleton({
  count = DEFAULT_COUNT,
  testId,
}: Props) {
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
          data-testid="makgeolli-card-skeleton"
          className={styles.card}
        >
          <div className={styles.imageBox} />
          <div className={styles.nameBar} />
          <div className={styles.tasteRow}>
            {Array.from({ length: TASTE_COUNT }).map((__, j) => (
              <div key={j} className={styles.tasteCell} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
