import { useNavigate } from "react-router-dom";
import { MakgeolliCard } from "./MakgeolliCard";
import { useNewReleases } from "./use-new-releases";
import styles from "./NewReleasesSection.module.css";

export function NewReleasesSection() {
  const { data: newReleases } = useNewReleases();
  const navigate = useNavigate();

  // 데이터 미수신(로딩/에러/빈 응답) 시 섹션 자체를 그리지 않는다.
  // 명시적 로딩/에러 UI는 후속 사이클(시나리오 #7·#8 RED)에서 추가 예정.
  if (!newReleases) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>신상 막걸리</h2>
      <div
        className={styles.list}
        style={{ marginLeft: -16, marginRight: -16 }}
      >
        {/* iOS WebKit overflow-x scroll에서 padding이 무시되는 버그 우회 — spacer div로 처리 */}
        <div style={{ width: 16, flexShrink: 0 }} aria-hidden="true" />
        {newReleases.map((makgeolli) => (
          <MakgeolliCard
            key={makgeolli.id}
            makgeolli={makgeolli}
            onClick={() => navigate(`/makgeolli/${makgeolli.id}`)}
          />
        ))}
        <div style={{ width: 16, flexShrink: 0 }} aria-hidden="true" />
      </div>
    </section>
  );
}
