import styles from "./LoadingState.module.css";

type Props = {
  testId?: string;
};

// iOS ProgressView() 미러 — fetch 진행 중 페이지 영역에 단순 spinner 표시.
// 스켈레톤(코멘트 리스트) 은 별도 사이클.
export function LoadingState({ testId }: Props) {
  return (
    <div
      data-testid={testId}
      className={styles.container}
      role="status"
      aria-label="로딩 중"
    >
      <div data-testid="loading-spinner" className={styles.spinner} />
    </div>
  );
}
