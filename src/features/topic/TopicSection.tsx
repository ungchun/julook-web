import { useAwards } from "./use-awards";
import styles from "./TopicSection.module.css";

// iOS MakgeolliTopicView 미러 — type === "korea_award"인 것만 카드로 노출.
// 좌측 award.name 단어별 줄바꿈, 우측 koreaAwardsLogo. 사용자 액션 없음.
export function TopicSection() {
  const { data } = useAwards();

  if (!data) return null;
  const koreaAwards = data.filter((a) => a.type === "korea_award");
  if (koreaAwards.length === 0) return null;

  return (
    <section data-testid="topic-section" className={styles.section}>
      <h2 className={styles.title}>주제로 찾기</h2>
      <div className={styles.list}>
        {koreaAwards.map((award) => (
          <div key={award.id} className={styles.card}>
            <div className={styles.cardName}>
              {/* iOS는 단어별 줄바꿈 — Web은 white-space: pre-line + 띄어쓰기를 \n으로 */}
              {award.name.split(" ").join("\n")}
            </div>
            <img
              className={styles.cardLogo}
              src="/assets/icon/korea_awards_logo.svg"
              alt=""
            />
          </div>
        ))}
      </div>
    </section>
  );
}
