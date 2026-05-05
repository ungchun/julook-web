import { useNavigate, useParams } from "react-router-dom";
import { MakgeolliCard } from "@/features/makgeolli-list";
import {
  getFilterMeta,
  useFilteredMakgeollis,
  type FilterSlug,
} from "@/features/filter";
import styles from "./Filter.module.css";

// /filter/:type — 단일 특징 필터 페이지. 사용자 액션은 카드 클릭(상세 진입)뿐.
// 정렬/페이지네이션 보류 (1단계). iOS FilterCore + fetchFilteredMakgeollis 임계값 미러.
export function Filter() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const meta = type != null ? getFilterMeta(type) : undefined;
  const slug = meta?.slug as FilterSlug | undefined;
  const { data } = useFilteredMakgeollis(slug);

  return (
    <main
      className={styles.main}
      style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 60 }}
    >
      <nav className={styles.navBar}>
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

      {meta == null ? (
        <p className={styles.empty}>지원하지 않는 필터입니다</p>
      ) : (
        <>
          <h1 className={styles.title}>{meta.label}</h1>
          {data && data.length === 0 ? (
            <p className={styles.empty}>결과가 없어요</p>
          ) : data ? (
            <div className={styles.list}>
              {data.map((m) => (
                <MakgeolliCard
                  key={m.id}
                  makgeolli={m}
                  onClick={() => navigate(`/makgeolli/${m.id}`)}
                />
              ))}
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
