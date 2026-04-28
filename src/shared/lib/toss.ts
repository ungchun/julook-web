/**
 * Apps in Toss SDK wrapper.
 *
 * 모든 SDK 호출은 이 모듈을 거친다. 컴포넌트/훅이 직접 `@apps-in-toss/web-framework`를 import 하지 않는다.
 * 테스트는 `vi.mock('@/shared/lib/toss')`로 모킹.
 */

// SDK API는 사용 시점에 lazy import + re-export로 추가 (예: requestReview, getServerTime 등).
// 현재는 빈 wrapper. 사용 케이스가 생길 때마다 함수 단위로 노출.

export const toss = {
  // 예시: requestReview를 쓸 때 추가
  // requestReview: async () => {
  //   const { requestReview } = await import("@apps-in-toss/web-framework");
  //   return requestReview();
  // },
};
