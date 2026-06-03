import { Fragment, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MakgeolliGridCard } from "@/features/makgeolli-list";
import {
  useMyAllActivity,
  useMyReactionActivity,
  useMyCommentActivity,
} from "@/features/my-activity";
import { useFavoriteMakgeollis } from "@/features/favorites";
import { CommentRow } from "@/shared/ui/CommentRow";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { SubTabHeader, type ActivityTab } from "./SubTabHeader";
import styles from "./MyActivity.module.css";

const VALID_TABS = new Set<ActivityTab>([
  "all",
  "like",
  "dislike",
  "comment",
  "favorite",
]);

function parseTab(raw: string | null): ActivityTab {
  if (raw != null && (VALID_TABS as Set<string>).has(raw)) {
    return raw as ActivityTab;
  }
  return "all";
}

type CardPaneProps = {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  items:
    | { makgeolli: { id: string; name: string } }[]
    | undefined;
  onCardClick: (id: string) => void;
};

function CardPane({
  isLoading,
  isError,
  onRetry,
  items,
  onCardClick,
}: CardPaneProps) {
  if (isError) {
    return (
      <div className={styles.centerSlot}>
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className={styles.centerSlot}>
        <LoadingState />
      </div>
    );
  }
  if (items?.length === 0) {
    return (
      <div className={styles.centerSlot}>
        <EmptyState message="비어있어요" />
      </div>
    );
  }
  if (items != null && items.length > 0) {
    return (
      <div className={styles.list}>
        {items.map((item) => (
          <MakgeolliGridCard
            key={item.makgeolli.id}
            makgeolli={item.makgeolli as never}
            onClick={() => onCardClick(item.makgeolli.id)}
          />
        ))}
      </div>
    );
  }
  return null;
}

// /my-activity — iOS MyMakgeolliView 미러. 5 sub-탭(전체/좋아요/싫어요/코멘트/찜).
//
// 코멘트 탭의 카드 클릭 동작:
//   다른 탭과 동일하게 Detail (/makgeolli/:id) 로 이동한다.
//   iOS MyMakgeolliCore.swift:128-130 의 `.myMakgeolliItemTapped → fetchMakgeolliDetailEffect`
//   가 모든 탭에서 동일 분기를 사용하므로 Web 도 통일.
//   수정/삭제 진입점은 Detail 의 MyCommentSection 단일 경로.
export function MyActivity() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selected = parseTab(searchParams.get("tab"));

  const all = useMyAllActivity();
  const liked = useMyReactionActivity("like");
  const disliked = useMyReactionActivity("dislike");
  const comments = useMyCommentActivity();
  const favorites = useFavoriteMakgeollis();
  const favoriteItems = favorites.data?.map((m) => ({ makgeolli: m }));

  // 전체 탭 — reaction/comment 합집합에 "찜 only" 막걸리를 dedup 추가.
  // 찜은 timestamp 가 없어 활동 항목 가장 위(가장 최근)로 배치.
  const allWithFavorites = useMemo(() => {
    const base = all.data;
    if (base == null) return base;
    const existing = new Set(base.map((i) => i.makgeolli.id));
    const favOnly = (favorites.data ?? [])
      .filter((m) => !existing.has(m.id))
      .map((m) => ({ makgeolli: m, lastActivityAt: "9999-12-31T00:00:00Z" }));
    return [...favOnly, ...base];
  }, [all.data, favorites.data]);

  const handleSelect = (tab: ActivityTab) => {
    if (tab === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const goDetail = (makgeolliId: string) => navigate(`/makgeolli/${makgeolliId}`);

  return (
    <main
      className={styles.main}
      style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 60 }}
    >
      <h1 className={styles.title}>내 활동</h1>
      <SubTabHeader selected={selected} onSelect={handleSelect} />

      {selected === "all" && (
        <CardPane
          isLoading={all.isLoading}
          isError={all.isError}
          onRetry={() => all.refetch()}
          items={allWithFavorites}
          onCardClick={goDetail}
        />
      )}
      {selected === "like" && (
        <CardPane
          isLoading={liked.isLoading}
          isError={liked.isError}
          onRetry={() => liked.refetch()}
          items={liked.data}
          onCardClick={goDetail}
        />
      )}
      {selected === "dislike" && (
        <CardPane
          isLoading={disliked.isLoading}
          isError={disliked.isError}
          onRetry={() => disliked.refetch()}
          items={disliked.data}
          onCardClick={goDetail}
        />
      )}
      {selected === "favorite" && (
        <CardPane
          isLoading={favorites.isLoading}
          isError={favorites.isError}
          onRetry={() => favorites.refetch()}
          items={favoriteItems}
          onCardClick={goDetail}
        />
      )}
      {selected === "comment" && (
        <>
          {comments.isError && (
            <div className={styles.centerSlot}>
              <ErrorState onRetry={() => comments.refetch()} />
            </div>
          )}
          {!comments.isError && comments.isLoading && (
            <div className={styles.centerSlot}>
              <LoadingState />
            </div>
          )}
          {!comments.isError && comments.data?.length === 0 && (
            <div className={styles.centerSlot}>
              <EmptyState message="비어있어요" />
            </div>
          )}
          {!comments.isError && comments.data != null && comments.data.length > 0 && (
            <div className={styles.commentList}>
              {comments.data.map((item, idx) => (
                <Fragment key={item.comment.id}>
                  <CommentRow
                    comment={item.comment}
                    makgeolli={item.makgeolli}
                    onClick={() => goDetail(item.makgeolli.id)}
                  />
                  {idx !== comments.data.length - 1 && (
                    <div className={styles.divider} />
                  )}
                </Fragment>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
