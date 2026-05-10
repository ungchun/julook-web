import styles from "./EmptyState.module.css";

type Props = {
  message: string;
  /** 호출자가 testid 를 지정 (기존 테스트 호환용). */
  testId?: string;
};

// iOS EmptyView 미러 — CommentListView / MyMakgeolliView / SearchView 의 공통 패턴.
// VStack(spacing 20) { Text(.SF17R, .w50) ; searchJulook svg height 140 }.
export function EmptyState({ message, testId }: Props) {
  return (
    <div data-testid={testId} className={styles.container}>
      <p className={styles.message}>{message}</p>
      <img
        className={styles.illustration}
        src="/assets/placeholder/search_julook.svg"
        alt=""
        role="presentation"
      />
    </div>
  );
}
