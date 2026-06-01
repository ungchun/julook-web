// 한 번이라도 onLoad 가 발생한 src 를 모듈 레벨로 메모이즈.
// 같은 src 의 컴포넌트가 다시 mount 될 때 (탭/페이지 재진입) spinner 깜빡임 차단.
// HTTP 캐시가 있어도 React state 가 매번 false → true 사이클을 도는 문제 해결.
export const loadedUrls = new Set<string>();

// 테스트 전용 — afterEach 에서 Set 을 비워 케이스간 격리.
export function __resetLoadedUrlsForTest(): void {
  loadedUrls.clear();
}
