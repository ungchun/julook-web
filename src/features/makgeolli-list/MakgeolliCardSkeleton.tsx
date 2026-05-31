import styles from "./MakgeolliCardSkeleton.module.css";

type Props = {
  count?: number;
  testId?: string;
};

const DEFAULT_COUNT = 5;

// MakgeolliCard(104×240) 동일 사이즈의 placeholder 카드.
// 내부는 빈 dark-gray 박스 + 중앙 spinner (이전 pulse skeleton 폐기 — 사용자 요청).
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
          <span className={styles.spinner} aria-hidden />
        </div>
      ))}
    </div>
  );
}
