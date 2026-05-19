import { useNavigate, useParams } from "react-router-dom";
import { MakgeolliCard } from "@/features/makgeolli-list";
import {
  getFilterMeta,
  useFilteredMakgeollis,
} from "@/features/filter";
import { PageNav } from "@/shared/ui/PageNav";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import styles from "./Filter.module.css";

// /filter/:type — 단일 특징 필터 페이지. 사용자 액션은 카드 클릭(상세 진입)뿐.
// 정렬/페이지네이션 보류 (1단계). iOS FilterCore + fetchFilteredMakgeollis 임계값 미러.
export function Filter() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const meta = type != null ? getFilterMeta(type) : undefined;
  const { data, isLoading, isError, refetch } = useFilteredMakgeollis(
    meta?.slug,
  );

  return (
    <main
      className={styles.main}
      style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 60 }}
    >
      <PageNav onClose={() => navigate(-1)} />

      {meta == null && <EmptyState message="지원하지 않는 필터입니다" />}
      {meta != null && (
        <>
          <h1 className={styles.title}>{meta.label}</h1>
          {isLoading && <LoadingState />}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {!isError && data?.length === 0 && (
            <EmptyState message="결과가 없어요" />
          )}
          {data != null && data.length > 0 && (
            <div className={styles.list}>
              {data.map((m) => (
                <MakgeolliCard
                  key={m.id}
                  makgeolli={m}
                  onClick={() => navigate(`/makgeolli/${m.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
