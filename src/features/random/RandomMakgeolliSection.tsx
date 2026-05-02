import { useNavigate } from "react-router-dom";
import { MakgeolliCard } from "@/features/makgeolli-list";
import { useRandomMakgeollis } from "./use-random-makgeollis";
// NewReleasesSection과 동일한 가로 스크롤 레이아웃 — 토큰만 다른 섹션에 재사용.
import sectionStyles from "@/features/makgeolli-list/NewReleasesSection.module.css";

// iOS RandomMakgeolliView 미러 — "이 막걸리는 어때요?" + 카드 5개 가로 스크롤.
export function RandomMakgeolliSection() {
  const { data } = useRandomMakgeollis();
  const navigate = useNavigate();

  if (!data || data.length === 0) return null;

  return (
    <section
      data-testid="random-makgeolli-section"
      className={sectionStyles.section}
    >
      <h2 className={sectionStyles.title}>이 막걸리는 어때요?</h2>
      <div className={sectionStyles.list}>
        {data.map((makgeolli) => (
          <MakgeolliCard
            key={makgeolli.id}
            makgeolli={makgeolli}
            onClick={() => navigate(`/makgeolli/${makgeolli.id}`)}
          />
        ))}
      </div>
    </section>
  );
}
