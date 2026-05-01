import styles from "./sections.module.css";

type IngredientsSectionProps = {
  ingredients: string[] | null;
};

// 원재료 섹션. ingredients가 null/빈 배열이면 미렌더.
// iOS와 동일하게 ", "로 join, 출처 표기 동반.
export function IngredientsSection({ ingredients }: IngredientsSectionProps) {
  if (ingredients == null || ingredients.length === 0) return null;

  return (
    <section data-testid="ingredients" className={styles.section}>
      <h2 className={styles.title}>원재료</h2>
      <p className={styles.ingredientsBody}>{ingredients.join(", ")}</p>
      <p className={styles.ingredientsSource}>출처: 제조사</p>
    </section>
  );
}
