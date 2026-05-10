import { useNavigate, useSearchParams } from "react-router-dom";
import { MakgeolliCard } from "@/features/makgeolli-list";
import { useMyAllActivity } from "@/features/my-activity";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { SubTabHeader, type ActivityTab } from "./SubTabHeader";
import styles from "./MyActivity.module.css";

const VALID_TABS = new Set<ActivityTab>(["all", "like", "dislike", "comment"]);

function parseTab(raw: string | null): ActivityTab {
  if (raw != null && (VALID_TABS as Set<string>).has(raw)) {
    return raw as ActivityTab;
  }
  return "all";
}

// /my-activity — iOS MyMakgeolliView 미러. 이번 사이클은 All 탭만.
// Like / Dislike / Comment 탭은 후속 사이클 (현재 EmptyState placeholder).
export function MyActivity() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selected = parseTab(searchParams.get("tab"));
  const { data, isLoading } = useMyAllActivity();

  const handleSelect = (tab: ActivityTab) => {
    if (tab === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  return (
    <main
      className={styles.main}
      style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 60 }}
    >
      <h1 className={styles.title}>내 활동</h1>
      <SubTabHeader selected={selected} onSelect={handleSelect} />

      {selected === "all" && (
        <>
          {isLoading && <LoadingState />}
          {data?.length === 0 && <EmptyState message="활동 기록이 없어요" />}
          {data != null && data.length > 0 && (
            <div className={styles.list}>
              {data.map((item) => (
                <MakgeolliCard
                  key={item.makgeolli.id}
                  makgeolli={item.makgeolli}
                  onClick={() =>
                    navigate(`/makgeolli/${item.makgeolli.id}`)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
      {selected !== "all" && <EmptyState message="준비 중입니다" />}
    </main>
  );
}
