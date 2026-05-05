import { useNavigate } from "react-router-dom";
import { FILTER_META, type FilterSlug } from "./types";
import styles from "./FilterSection.module.css";

const FILTER_ORDER: readonly FilterSlug[] = [
  "thick",
  "sweet",
  "sour",
  "carbonated",
  "no-sweetener",
];

// iOS MakgeolliFilterView 미러 — 항목 탭 시 /filter/:slug 진입.
export function FilterSection() {
  const navigate = useNavigate();

  return (
    <section data-testid="filter-section" className={styles.section}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>특징으로 찾기</h2>
        <img
          className={styles.titleArrow}
          src="/assets/arrow/right.svg"
          alt=""
        />
      </div>
      <div className={styles.list}>
        {FILTER_ORDER.map((slug) => {
          const meta = FILTER_META[slug];
          return (
            <button
              key={slug}
              type="button"
              className={styles.cell}
              onClick={() => navigate(`/filter/${slug}`)}
            >
              <div className={styles.iconBox}>
                <img className={styles.icon} src={meta.icon} alt="" />
              </div>
              <span className={styles.label}>{meta.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
