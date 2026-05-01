import { useParams } from "react-router-dom";
import { getMakgeolliImageUrl } from "@/shared/lib/makgeolli-image";
import { useMakgeolli } from "@/features/makgeolli-detail";

// D2 사이클: id 노출 + 단건 페치 + 핵심 정보(이름/양조장/알콜/이미지) 표시.
// 맛 4지표·수상·원재료 등은 D3에서 추가, 로딩/에러 UI는 시나리오 #7·#8에서.
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
        </>
      ) : (
        <h1>막걸리 상세</h1>
      )}
    </main>
  );
}
