import { useParams } from "react-router-dom";

// D1 사이클의 빈 상세 셸. 데이터 페치/시각 디자인은 후속(D2/D3) 사이클에서 추가.
// useParams의 id는 라우트 매처가 보장하지만 TS 타입은 optional.
// 미정의 시 빈 문자열로 렌더되며, 라우트 등록상 도달 불가 경로다.
export function Detail() {
  const { id } = useParams<{ id: string }>();

  return (
    <main>
      <h1>막걸리 상세</h1>
      <span data-testid="detail-id">{id}</span>
    </main>
  );
}
