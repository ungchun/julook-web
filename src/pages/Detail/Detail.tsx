import { useNavigate, useParams } from "react-router-dom";
import { MakgeolliImage } from "@/shared/ui/MakgeolliImage";
import {
  useMakgeolli,
  TasteScoresSection,
  AwardsSection,
  EvaluationSection,
  IngredientsSection,
} from "@/features/makgeolli-detail";
import { ReactionButtons } from "@/features/reaction";
import { MyCommentSection } from "@/features/my-comment";
import { useFavorites } from "@/features/favorites";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import styles from "./Detail.module.css";

// D2: id/이름/양조장/알콜/이미지 + not-found 분기.
// D3: 맛 4지표 + 수상 + 원재료 + 양조장 링크 (각 섹션 컴포넌트로 분리).
// 차트 시각 자산은 C+, 로딩/에러 UI는 시나리오 #7·#8에서.
export function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isSuccess, isError, refetch } = useMakgeolli(id);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const fav = id != null && isFavorite(id);

  return (
    <main
      className={styles.main}
      style={{
        paddingTop: 16,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
      }}
    >
      <span data-testid="detail-id" className={styles.detailId}>
        {id}
      </span>
      <nav className={styles.navBar}>
        <button
          type="button"
          className={`${styles.heartButton} ${fav ? styles.heartActive : ""}`}
          aria-label={fav ? "찜 해제" : "찜하기"}
          aria-pressed={fav}
          onClick={() => id != null && void toggleFavorite(id)}
        >
          <svg
            className={styles.heartIcon}
            viewBox="0 0 24 24"
            fill={fav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
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
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isSuccess && data === null ? (
        <EmptyState message="막걸리를 찾을 수 없습니다" />
      ) : data ? (
        <>
          <header className={styles.header}>
            <div className={styles.imageBox}>
              <MakgeolliImage
                className={styles.image}
                imageName={data.image_name}
                alt={data.name}
              />
            </div>
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
          <MyCommentSection makgeolliId={data.id} />
          <AwardsSection awards={data.awards} />
          <EvaluationSection makgeolliId={data.id} />
          <IngredientsSection ingredients={data.ingredients} />
        </>
      ) : (
        <LoadingState />
      )}
    </main>
  );
}
