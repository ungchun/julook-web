import { useLocation, useNavigate } from "react-router-dom";
import styles from "./BottomTabBar.module.css";

// iOS TabsView 미러 — 라벨스캔/찜 제외, 3탭 (모아/검색/내 활동).
// 아이콘: home/search는 iOS 자산 그대로, 내 활동은 reaction/heart_fill 재사용.
const TABS = [
  { path: "/", label: "모아보기", icon: "/assets/tab/home.svg" },
  { path: "/search", label: "검색", icon: "/assets/tab/search.svg" },
  {
    path: "/my-activity",
    label: "내 활동",
    icon: "/assets/reaction/heart_fill.svg",
  },
] as const;

function isActive(currentPath: string, tabPath: string): boolean {
  if (tabPath === "/") return currentPath === "/";
  return currentPath.startsWith(tabPath);
}

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Detail 같은 push 화면에선 탭바를 그대로 보여줌 (iOS도 NavigationStack 위에 노출).
  return (
    <nav className={styles.bar} aria-label="하단 탭">
      {TABS.map((tab) => {
        const active = isActive(location.pathname, tab.path);
        return (
          <button
            key={tab.path}
            type="button"
            className={styles.tab}
            aria-current={active ? "page" : undefined}
            onClick={() => navigate(tab.path)}
          >
            <img className={styles.icon} src={tab.icon} alt="" />
            <span className={styles.label}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
