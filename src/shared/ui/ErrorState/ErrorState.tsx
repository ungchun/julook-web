import styles from "./ErrorState.module.css";

type Props = {
  message?: string;
  onRetry?: () => void;
  testId?: string;
};

const DEFAULT_MESSAGE = "잠시 후 다시 시도해주세요";

// fetch 실패 시 페이지 영역에 표시되는 인라인 에러. EmptyState 와 동일 레이아웃 +
// onRetry 가 있을 때만 재시도 버튼을 노출한다. Apps in Toss native toast 미지원
// 이므로 인라인 형태로 일관 처리.
export function ErrorState({ message, onRetry, testId }: Props) {
  return (
    <div data-testid={testId} className={styles.container}>
      <p className={styles.message}>{message ?? DEFAULT_MESSAGE}</p>
      <img
        className={styles.illustration}
        src="/assets/placeholder/search_julook.svg"
        alt=""
        role="presentation"
      />
      {onRetry != null && (
        <button
          type="button"
          className={styles.retry}
          onClick={onRetry}
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
