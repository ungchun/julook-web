import type { Makgeolli } from "@/shared/types";
import { MakgeolliImage } from "@/shared/ui/MakgeolliImage";
import styles from "./MakgeolliCard.module.css";

type MakgeolliCardProps = {
  makgeolli: Makgeolli;
  onClick?: () => void;
};

// 맛 4지표 약어 라벨 (iOS L10n.Common.Taste.{sweetness,sourness,thickness,carbonation}Short).
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

// 0~5 점수에 해당하는 차트 SVG. null/범위 외는 nill.svg.
function chartSrc(value: number | null): string {
  if (value === null || value < 0 || value > 5) return "/assets/chart/nill.svg";
  return `/assets/chart/${value}.svg`;
}

export function MakgeolliCard({ makgeolli, onClick }: MakgeolliCardProps) {
  return (
    <div data-testid="makgeolli-card" className={styles.card} onClick={onClick}>
      <div className={styles.imageBox}>
        <MakgeolliImage
          className={styles.image}
          imageName={makgeolli.image_name}
          alt={makgeolli.name}
        />
      </div>
      <span className={styles.name}>{makgeolli.name}</span>
      <div className={styles.tasteRow}>
        {TASTE_LABELS.map(({ key, label }) => (
          <div key={key} className={styles.tasteCell}>
            <img
              className={styles.tasteChart}
              src={chartSrc(makgeolli[key])}
              alt=""
            />
            <span className={styles.tasteLabel}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
