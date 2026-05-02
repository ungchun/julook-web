import type { Makgeolli } from "@/shared/types";
import styles from "./sections.module.css";

// 맛 4지표 라벨 (iOS L10n.Common.Taste.* 미러: 달·시·걸·탄).
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

// 0~5 점수에 해당하는 score SVG (44x44). null/범위 외는 nill.svg.
function scoreSrc(value: number | null): string {
  if (value === null || value < 0 || value > 5) return "/assets/score/nill.svg";
  return `/assets/score/${value}.svg`;
}

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
            <img
              className={styles.tasteScoreImg}
              src={scoreSrc(props[key])}
              alt=""
            />
            <span className={styles.tasteLabel}>{label}</span>
            {/* 점수 텍스트는 sr-only — 시각은 SVG로 표현, 테스트(toHaveTextContent)는 텍스트로 검증 */}
            <span data-testid="taste-score" className={styles.srOnly}>
              {props[key] ?? "-"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
