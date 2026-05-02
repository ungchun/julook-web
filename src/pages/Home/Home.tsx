import { NewReleasesSection } from "@/features/makgeolli-list";
import { PopularSection } from "@/features/popular";
import { RandomMakgeolliSection } from "@/features/random";
import { TopicSection } from "@/features/topic";
import { RecentCommentsSection } from "@/features/recent-comments";
import { FilterSection } from "@/features/filter";
import styles from "./Home.module.css";

// iOS HomeView 섹션 순서 미러 (사용자 액션 컴포넌트는 단계적 추가).
// 1. Header / 2. Filter(특징으로 찾기) / 3. Random / 4. Popular(인기) /
// 5. NewReleases / 6. Topic(수상) / 7. RecentComments
export function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>주룩</h1>
        {/* gear 아이콘 자리 — Phase I(설정 페이지)에서 채움 */}
        <div className={styles.settingsSlot} aria-hidden="true" />
      </header>
      <FilterSection />
      <RandomMakgeolliSection />
      <PopularSection />
      <NewReleasesSection />
      <TopicSection />
      <RecentCommentsSection />
    </main>
  );
}
