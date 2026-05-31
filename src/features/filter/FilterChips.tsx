import { FILTER_META, type FilterSlug } from "./types";
import styles from "./FilterChips.module.css";

type Props = {
  slugs: FilterSlug[];
  selected: Set<FilterSlug>;
  onToggle: (slug: FilterSlug) => void;
};

// iOS FilterOptionsView 미러 — 가로 스크롤 칩, lilac(선택)/w10(미선택) 토글.
export function FilterChips({ slugs, selected, onToggle }: Props) {
  return (
    <div className={styles.scroll}>
      <div className={styles.row}>
        {slugs.map((slug) => {
          const isOn = selected.has(slug);
          return (
            <button
              key={slug}
              type="button"
              className={`${styles.chip} ${isOn ? styles.chipOn : styles.chipOff}`}
              aria-pressed={isOn}
              onClick={() => onToggle(slug)}
            >
              {FILTER_META[slug].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
