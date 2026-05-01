import styles from "./sections.module.css";

type BreweryWebsiteSectionProps = {
  brewery: string | null;
  website: string | null;
};

// 양조장 링크 섹션. brewery + website 둘 다 있을 때만 렌더.
// 외부 링크라 target="_blank" + rel="noopener noreferrer" 필수.
export function BreweryWebsiteSection({
  brewery,
  website,
}: BreweryWebsiteSectionProps) {
  if (brewery == null || website == null) return null;

  return (
    <section data-testid="brewery-website" className={styles.section}>
      <h2 className={styles.title}>양조장 링크</h2>
      <a
        className={styles.breweryLink}
        href={website}
        target="_blank"
        rel="noopener noreferrer"
      >
        {brewery}
      </a>
    </section>
  );
}
