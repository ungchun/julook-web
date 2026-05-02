import { NewReleasesSection } from "@/features/makgeolli-list";
import styles from "./Home.module.css";

export function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>주룩</h1>
        {/* gear 아이콘 자리 — Phase I(설정 페이지)에서 채움 */}
        <div className={styles.settingsSlot} aria-hidden="true" />
      </header>
      <NewReleasesSection />
    </main>
  );
}
