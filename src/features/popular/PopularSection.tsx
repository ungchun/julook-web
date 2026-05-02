import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import type { Makgeolli } from "@/shared/types";
import { getMakgeolliImageUrl } from "@/shared/lib/makgeolli-image";
import { useTopLiked } from "./use-top-liked";
import styles from "./PopularSection.module.css";

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

// iOS TodaysRankingView 미러 — 인기 막걸리 Top 3.
// 사용자 액션(찜 토글)은 의도적으로 제외 (사용자 요청).
export function PopularSection() {
  const { data } = useTopLiked();
  const navigate = useNavigate();

  if (!data || data.length === 0) return null;

  return (
    <section data-testid="popular-section" className={styles.section}>
      <h2 className={styles.title}>인기 막걸리</h2>
      <div className={styles.list}>
        {data.map((makgeolli, idx) => {
          const imageUrl = getMakgeolliImageUrl(makgeolli.image_name);
          return (
            <Fragment key={makgeolli.id}>
              <div
                className={styles.row}
                onClick={() => navigate(`/makgeolli/${makgeolli.id}`)}
              >
                <span className={styles.rank}>{idx + 1}</span>
                <div className={styles.imageBox}>
                  {imageUrl && (
                    <img
                      className={styles.image}
                      src={imageUrl}
                      alt={makgeolli.name}
                    />
                  )}
                </div>
                <div className={styles.body}>
                  <span className={styles.name}>{makgeolli.name}</span>
                  <div className={styles.tasteRow}>
                    {TASTE_LABELS.map(({ key, label }) => (
                      <div key={key} className={styles.tasteCell}>
                        <img
                          className={styles.tasteScoreImg}
                          src={scoreSrc(makgeolli[key])}
                          alt=""
                        />
                        <span className={styles.tasteLabel}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {idx !== data.length - 1 && <div className={styles.divider} />}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
