import { useNavigate } from "react-router-dom";
import { MakgeolliCard } from "./MakgeolliCard";
import { MakgeolliCardSkeleton } from "./MakgeolliCardSkeleton";
import { useNewReleases } from "./use-new-releases";
import styles from "./NewReleasesSection.module.css";

export function NewReleasesSection() {
  const { data: newReleases, isLoading } = useNewReleases();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>신상 막걸리</h2>
        <div className={styles.list}>
          <div className={styles.edgeSpacer} aria-hidden="true" />
          <MakgeolliCardSkeleton count={5} />
          <div className={styles.edgeSpacer} aria-hidden="true" />
        </div>
      </section>
    );
  }
  if (!newReleases) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>신상 막걸리</h2>
      <div className={styles.list}>
        <div className={styles.edgeSpacer} aria-hidden="true" />
        {newReleases.map((makgeolli) => (
          <MakgeolliCard
            key={makgeolli.id}
            makgeolli={makgeolli}
            onClick={() => navigate(`/makgeolli/${makgeolli.id}`)}
          />
        ))}
        <div className={styles.edgeSpacer} aria-hidden="true" />
      </div>
    </section>
  );
}
