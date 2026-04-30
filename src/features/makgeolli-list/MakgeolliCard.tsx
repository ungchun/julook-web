import type { Makgeolli } from "@/shared/types";
import { getMakgeolliImageUrl } from "./api";

type MakgeolliCardProps = {
  makgeolli: Makgeolli;
  onClick?: () => void;
};

// 맛 4지표 라벨 매핑 (단/시/걸/탄). iOS 본앱 docs/coding/models.md 표기와 동일.
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

export function MakgeolliCard({ makgeolli, onClick }: MakgeolliCardProps) {
  const imageUrl = getMakgeolliImageUrl(makgeolli.image_name);

  return (
    <div data-testid="makgeolli-card" onClick={onClick}>
      {imageUrl ? (
        <img src={imageUrl} alt={makgeolli.name} />
      ) : (
        <div data-testid="makgeolli-card-image-placeholder" />
      )}
      <span>{makgeolli.name}</span>
      <div>
        {TASTE_LABELS.map(({ key, label }) => (
          <span key={key}>
            {label} {makgeolli[key] ?? "-"}
          </span>
        ))}
      </div>
    </div>
  );
}
