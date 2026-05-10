import { useNavigate, useParams } from "react-router-dom";
import { getMakgeolliImageUrl } from "@/shared/lib/makgeolli-image";
import {
  useMakgeolli,
  TasteScoresSection,
  AwardsSection,
  IngredientsSection,
  BreweryWebsiteSection,
} from "@/features/makgeolli-detail";
import { ReactionButtons } from "@/features/reaction";
import { DetailCommentsSection } from "@/features/detail-comments";
import { EmptyState } from "@/shared/ui/EmptyState";
import styles from "./Detail.module.css";

// D2: id/이름/양조장/알콜/이미지 + not-found 분기.
// D3: 맛 4지표 + 수상 + 원재료 + 양조장 링크 (각 섹션 컴포넌트로 분리).
// 차트 시각 자산은 C+, 로딩/에러 UI는 시나리오 #7·#8에서.
export function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isSuccess } = useMakgeolli(id);

  const imageUrl =
    data?.image_name != null ? getMakgeolliImageUrl(data.image_name) : null;

  return (
    <main
      className={styles.main}
      style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 60 }}
    >
      <span data-testid="detail-id" className={styles.detailId}>
        {id}
      </span>
      <nav className={styles.navBar}>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="닫기"
          onClick={() => navigate(-1)}
        >
          <img
            className={styles.closeIcon}
            src="/assets/icon/close.svg"
            alt=""
          />
        </button>
      </nav>
      {isSuccess && data === null ? (
        <EmptyState message="막걸리를 찾을 수 없습니다" />
      ) : data ? (
        <>
          <header className={styles.header}>
            {imageUrl != null && (
              <div className={styles.imageBox}>
                <img className={styles.image} src={imageUrl} alt={data.name} />
              </div>
            )}
            <h1 className={styles.name}>{data.name}</h1>
            {(data.brewery != null || data.alcohol_percentage != null) && (
              <div className={styles.metaRow}>
                {data.brewery != null && <span>{data.brewery}</span>}
                {data.alcohol_percentage != null && (
                  <span>{data.alcohol_percentage}%</span>
                )}
              </div>
            )}
          </header>

          <TasteScoresSection
            sweetness={data.sweetness}
            sourness={data.sourness}
            thickness={data.thickness}
            carbonation={data.carbonation}
          />
          <ReactionButtons makgeolliId={data.id} />
          <AwardsSection awards={data.awards} />
          <IngredientsSection ingredients={data.ingredients} />
          <BreweryWebsiteSection
            brewery={data.brewery}
            website={data.website}
          />
          <DetailCommentsSection makgeolliId={data.id} />
        </>
      ) : (
        <h1 className={styles.name}>막걸리 상세</h1>
      )}
    </main>
  );
}
