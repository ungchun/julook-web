import styles from "./RecentSearches.module.css";

type Props = {
  items: string[];
  onSelect: (keyword: string) => void;
  onRemove: (index: number) => void;
  onClearAll: () => void;
};

export function RecentSearches({
  items,
  onSelect,
  onRemove,
  onClearAll,
}: Props) {
  return (
    <section className={styles.section} data-testid="recent-searches">
      <header className={styles.header}>
        <h2 className={styles.title}>최근 검색어</h2>
        <button
          type="button"
          className={styles.clearAll}
          onClick={onClearAll}
        >
          지우기
        </button>
      </header>
      <ul className={styles.list}>
        {items.map((item, idx) => (
          <li key={`${item}-${idx}`} className={styles.row}>
            <button
              type="button"
              className={styles.label}
              onClick={() => onSelect(item)}
            >
              {item}
            </button>
            <button
              type="button"
              className={styles.remove}
              aria-label={`${item} 삭제`}
              onClick={() => onRemove(idx)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
