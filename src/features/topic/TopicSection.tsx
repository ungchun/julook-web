import { useNavigate } from "react-router-dom";
import { useAwards } from "./use-awards";
import styles from "./TopicSection.module.css";

// iOS MakgeolliTopicView 미러 — type === "korea_award"인 것만 카드로 노출.
// 카드 탭 시 /awards/:awardId 진입 (iOS .topicItemTapped → MainCoordinator push 미러).
export function TopicSection() {
  const { data } = useAwards();
  const navigate = useNavigate();

  if (!data) return null;
  const koreaAwards = data.filter((a) => a.type === "korea_award");
  if (koreaAwards.length === 0) return null;

  return (
    <section data-testid="topic-section" className={styles.section}>
      <h2 className={styles.title}>주제로 찾기</h2>
      <div className={styles.list}>
        {koreaAwards.map((award) => (
          <button
            key={award.id}
            type="button"
            className={styles.card}
            onClick={() => navigate(`/awards/${award.id}`)}
          >
            <div className={styles.cardName}>
              {award.name.split(" ").join("\n")}
            </div>
            <img
              className={styles.cardLogo}
              src="/assets/icon/korea_awards_logo.svg"
              alt=""
            />
          </button>
        ))}
      </div>
    </section>
  );
}
