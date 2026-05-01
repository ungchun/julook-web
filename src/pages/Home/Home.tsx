import { NewReleasesSection } from "@/features/makgeolli-list";
import styles from "./Home.module.css";

export function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>주룩</h1>
        <p className={styles.subtitle}>막걸리 정보 미니앱 — 곧 만나요.</p>
      </header>
      <NewReleasesSection />
    </main>
  );
}
