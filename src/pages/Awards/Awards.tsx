import { useNavigate, useParams } from "react-router-dom";
import { MakgeolliCard } from "@/features/makgeolli-list";
import { useAward, useMakgeollisByAward } from "@/features/awards";
import { PageNav } from "@/shared/ui/PageNav";
import { EmptyState } from "@/shared/ui/EmptyState";
import styles from "./Awards.module.css";

// /awards/:awardId — 특정 수상에 포함된 막걸리 리스트.
// iOS FilterCore(isTopicMode=true) + fetchMakgeollisByAward 미러.
// :awardId 는 awards 테이블의 UUID (한국어 name 을 URL 에 그대로 넣지 않기 위함).
export function Awards() {
  const { awardId } = useParams<{ awardId: string }>();
  const navigate = useNavigate();
  const { data: award, isSuccess: awardSucceeded } = useAward(awardId);
  const { data: makgeollis } = useMakgeollisByAward(award?.name);

  return (
    <main
      className={styles.main}
      style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 60 }}
    >
      <PageNav onClose={() => navigate(-1)} />

      {awardSucceeded && award == null && (
        <EmptyState message="수상 정보를 찾을 수 없습니다" />
      )}
      {award != null && (
        <>
          <h1 className={styles.title}>{award.name}</h1>
          {makgeollis?.length === 0 && <EmptyState message="결과가 없어요" />}
          {makgeollis != null && makgeollis.length > 0 && (
            <div className={styles.list}>
              {makgeollis.map((m) => (
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
