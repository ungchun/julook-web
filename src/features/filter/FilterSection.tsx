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

// iOS MakgeolliFilterView 미러 — 헤더 전체 클릭 시 /filter (빈 선택) 진입,
// 각 칩 클릭 시 /filter/:slug (deep-link, 해당 칩만 선택된 상태) 진입.
export function FilterSection() {
  const navigate = useNavigate();

  return (
    <section data-testid="filter-section" className={styles.section}>
      <button
        type="button"
        className={styles.titleRow}
        onClick={() => navigate("/filter")}
      >
        <span className={styles.title}>특징으로 찾기</span>
        <img
          className={styles.titleArrow}
          src="/assets/arrow/right.svg"
          alt=""
        />
      </button>
      <div className={styles.list}>
        <div className={styles.edgeSpacer} aria-hidden="true" />
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
        <div className={styles.edgeSpacer} aria-hidden="true" />
      </div>
    </section>
  );
}
