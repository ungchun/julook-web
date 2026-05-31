import type { SortOption } from "./sort";
import styles from "./SortSelector.module.css";

type Props = {
  value: SortOption;
  onChange: (sort: SortOption) => void;
};

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "추천순" },
  { value: "highAlcohol", label: "높은 도수순" },
  { value: "lowAlcohol", label: "낮은 도수순" },
];

// iOS SortOptionsView 우측 Menu+Picker 미러 — native select로 단순화 (Apps in Toss 호환).
// "어떤 순서로 정렬되나요?" 좌측 안내는 사용자 요청으로 생략.
export function SortSelector({ value, onChange }: Props) {
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <div className={styles.wrap}>
      <label className={styles.label}>
        <span aria-hidden className={styles.text}>
          {current.label}
        </span>
        <svg
          aria-hidden
          className={styles.chevron}
          width="8"
          height="12"
          viewBox="0 0 10 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 0.5L1 4.5H9L5 0.5Z" fill="currentColor" />
          <path d="M5 13.5L9 9.5H1L5 13.5Z" fill="currentColor" />
        </svg>
        <select
          aria-label="정렬 선택"
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
