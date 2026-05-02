import styles from "./FilterSection.module.css";

// iOS FilterType (CaseIterable) 미러. 정적 5개 — 서버 fetch 없음.
// 라벨은 iOS L10n.Filter.Kind 미러 (한국어).
const FILTERS = [
  { id: "thick", label: "걸쭉한", icon: "/assets/filter/thick.svg" },
  { id: "sweet", label: "달달한", icon: "/assets/filter/sweet.svg" },
  { id: "sour", label: "시큼한", icon: "/assets/filter/sour.svg" },
  {
    id: "carbonated",
    label: "탄산감 많은",
    icon: "/assets/filter/carbonated.svg",
  },
  {
    id: "no-sweetener",
    label: "감미료 없는",
    icon: "/assets/filter/no-sweetener.svg",
  },
] as const;

// iOS MakgeolliFilterView 미러 — 헤더 클릭/항목 클릭 시 필터 페이지 진입은 H 페이즈에서.
export function FilterSection() {
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
      <div
        className={styles.list}
        style={{ marginLeft: -16, marginRight: -16 }}
      >
        <div style={{ width: 16, flexShrink: 0 }} aria-hidden="true" />
        {FILTERS.map((filter) => (
          <div key={filter.id} className={styles.cell}>
            <div className={styles.iconBox}>
              <img className={styles.icon} src={filter.icon} alt="" />
            </div>
            <span className={styles.label}>{filter.label}</span>
          </div>
        ))}
        <div style={{ width: 16, flexShrink: 0 }} aria-hidden="true" />
      </div>
    </section>
  );
}
