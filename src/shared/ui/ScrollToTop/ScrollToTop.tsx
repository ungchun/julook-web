import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// 라우트 변경 시 항상 스크롤을 최상단으로 — iOS NavigationStack push 동작 미러.
// React Router 기본 동작은 브라우저 history scrollRestoration 에 의존해 뒤로/앞으로 시
// 이전 위치를 복원하지만, 미니앱 UX 기준으로는 새 화면은 항상 0,0 부터 시작해야 한다.
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
