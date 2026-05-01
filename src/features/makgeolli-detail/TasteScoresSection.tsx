import type { Makgeolli } from "@/shared/types";
import styles from "./sections.module.css";

// 맛 4지표 라벨 (iOS docs/coding/models.md와 동일: 단·시·걸·탄).
// 맛 차트 시각 자산(0_score.png 등 14장) 이식은 C+ 사이클에서.
const TASTE_LABELS = [
  { key: "sweetness", label: "달" },
  { key: "sourness", label: "시" },
  { key: "thickness", label: "걸" },
  { key: "carbonation", label: "탄" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<
    Makgeolli,
    "sweetness" | "sourness" | "thickness" | "carbonation"
  >;
  label: string;
}>;

type TasteScoresSectionProps = Pick<
  Makgeolli,
  "sweetness" | "sourness" | "thickness" | "carbonation"
>;

export function TasteScoresSection(props: TasteScoresSectionProps) {
  return (
    <section data-testid="taste-scores" className={styles.section}>
      <div className={styles.tasteRow}>
        {TASTE_LABELS.map(({ key, label }) => (
          <div key={key} className={styles.tasteCell}>
            <span className={styles.tasteLabel}>{label}</span>
            <span data-testid="taste-score" className={styles.tasteScore}>
              {props[key] ?? "-"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
