import styles from "./sections.module.css";

type AwardsSectionProps = {
  awards: string[] | null;
};

// 수상 섹션. awards가 null/빈 배열이면 미렌더.
// award 문자열 파싱(year/competition/prize)은 D3 비범위 — 단순 텍스트로 노출.
export function AwardsSection({ awards }: AwardsSectionProps) {
  if (awards == null || awards.length === 0) return null;

  return (
    <section data-testid="awards" className={styles.section}>
      <h2 className={styles.title}>수상</h2>
      <ul className={styles.awardList}>
        {awards.map((award) => (
          <li key={award} className={styles.awardItem}>
            {award}
          </li>
        ))}
      </ul>
    </section>
  );
}
