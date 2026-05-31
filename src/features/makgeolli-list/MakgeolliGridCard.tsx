import type { Makgeolli } from "@/shared/types";
import { MakgeolliImage } from "@/shared/ui/MakgeolliImage";
import styles from "./MakgeolliGridCard.module.css";

type Props = {
  makgeolli: Makgeolli;
  onClick?: () => void;
};

// iOS MakgeolliGridView.MakgeolliCardView 미러 — Filter/Awards 그리드 전용.
// 홈 carousel용 <MakgeolliCard>(104x240)와는 별개.
const TASTE_LABELS = [
  { key: "sweetness", label: "단맛" },
  { key: "sourness", label: "신맛" },
  { key: "thickness", label: "걸쭉" },
  { key: "carbonation", label: "탄산" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<
    Makgeolli,
    "sweetness" | "sourness" | "thickness" | "carbonation"
  >;
  label: string;
}>;

function scoreSrc(value: number | null): string {
  if (value === null || value < 0 || value > 5) return "/assets/score/nill.svg";
  return `/assets/score/${value}.svg`;
}

function formatAlcohol(value: number | null): string {
  if (value === null) return "-";
  return `${value.toFixed(1)}도`;
}

export function MakgeolliGridCard({ makgeolli, onClick }: Props) {
  const subtitle =
    makgeolli.brewery != null
      ? `${makgeolli.brewery} · ${formatAlcohol(makgeolli.alcohol_percentage)}`
      : formatAlcohol(makgeolli.alcohol_percentage);

  return (
    <div
      data-testid="makgeolli-grid-card"
      className={styles.card}
      onClick={onClick}
    >
      <div className={styles.imageBox}>
        <MakgeolliImage
          className={styles.image}
          imageName={makgeolli.image_name}
          alt={makgeolli.name}
        />
      </div>
      <div className={styles.nameLine}>
        <span className={styles.name}>{makgeolli.name}</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </div>
      <div className={styles.scoreRow}>
        {TASTE_LABELS.map(({ key, label }) => (
          <div key={key} className={styles.scoreCell}>
            <img
              className={styles.scoreImg}
              src={scoreSrc(makgeolli[key])}
              alt=""
            />
            <span className={styles.scoreLabel}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
