import styles from "./SubTabHeader.module.css";

export type ActivityTab = "all" | "like" | "dislike" | "comment";

const TABS: ReadonlyArray<{ slug: ActivityTab; label: string }> = [
  { slug: "all", label: "전체" },
  { slug: "like", label: "좋아요" },
  { slug: "dislike", label: "싫어요" },
  { slug: "comment", label: "코멘트" },
];

type Props = {
  selected: ActivityTab;
  onSelect: (tab: ActivityTab) => void;
};

// iOS MyMakgeolliFilterTab 미러 — favorite 탭만 제외(Web 비범위).
// Picker(.segmented) 대신 단순 button row + 활성 강조.
export function SubTabHeader({ selected, onSelect }: Props) {
  return (
    <div className={styles.row}>
      {TABS.map((tab) => {
        const active = tab.slug === selected;
        return (
          <button
            key={tab.slug}
            type="button"
            aria-current={active ? "true" : undefined}
            className={active ? styles.tabActive : styles.tab}
            onClick={() => onSelect(tab.slug)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
