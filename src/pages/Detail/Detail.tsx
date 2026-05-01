import { useParams } from "react-router-dom";
import { getMakgeolliImageUrl } from "@/shared/lib/makgeolli-image";
import {
  useMakgeolli,
  TasteScoresSection,
  AwardsSection,
  IngredientsSection,
  BreweryWebsiteSection,
} from "@/features/makgeolli-detail";
import { ReactionButtons } from "@/features/reaction";

// D2: id/이름/양조장/알콜/이미지 + not-found 분기.
// D3: 맛 4지표 + 수상 + 원재료 + 양조장 링크 (각 섹션 컴포넌트로 분리).
// 차트 시각 자산은 C+, 로딩/에러 UI는 시나리오 #7·#8에서.
export function Detail() {
  const { id } = useParams<{ id: string }>();
  const { data, isSuccess } = useMakgeolli(id);

  const imageUrl =
    data?.image_name != null ? getMakgeolliImageUrl(data.image_name) : null;

  return (
    <main>
      <span data-testid="detail-id">{id}</span>
      {isSuccess && data === null ? (
        <h1>막걸리를 찾을 수 없습니다</h1>
      ) : data ? (
        <>
          <h1>{data.name}</h1>
          {data.brewery != null && <p>{data.brewery}</p>}
          {data.alcohol_percentage != null && (
            <p>{data.alcohol_percentage}%</p>
          )}
          {imageUrl != null && <img src={imageUrl} alt={data.name} />}

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
        </>
      ) : (
        <h1>막걸리 상세</h1>
      )}
    </main>
  );
}
