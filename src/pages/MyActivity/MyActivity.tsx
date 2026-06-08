import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Makgeolli, ReactionType } from "@/shared/types";
import {
  MyActivityGridCard,
  useMyActivityDecorations,
  useMyAllActivity,
  useMyCommentActivity,
  useMyReactionActivity,
} from "@/features/my-activity";
import { useFavoriteMakgeollis } from "@/features/favorites";
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

type Decorations = {
  reactionByMakgeolliId: ReadonlyMap<string, ReactionType>;
  commentSet: ReadonlySet<string>;
  favoriteSet: ReadonlySet<string>;
};

type CardPaneProps = {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  items: { makgeolli: Makgeolli }[] | undefined;
  decorations: Decorations | undefined;
  onCardClick: (id: string) => void;
};

function CardPane({
  isLoading,
  isError,
  onRetry,
  items,
  decorations,
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
          <MyActivityGridCard
            key={item.makgeolli.id}
            makgeolli={item.makgeolli}
            reactionType={
              decorations?.reactionByMakgeolliId.get(item.makgeolli.id) ?? null
            }
            hasComment={
              decorations?.commentSet.has(item.makgeolli.id) ?? false
            }
            isFavorite={
              decorations?.favoriteSet.has(item.makgeolli.id) ?? false
            }
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
// 모든 탭이 동일한 MyActivityGridCard 를 그리는 단일 렌더 경로.
// decoration(reaction/comment/favorite) 은 페이지 단의 useMyActivityDecorations 가
// 1회 호출로 통합 fetch, 각 카드에 props 로 주입 (N+1 회피).
//
// 코멘트 탭도 본문이 아닌 그리드 카드만 표시 — iOS MyMakgeolliView ForEach
// 단일 분기 미러. 본문 확인은 카드 탭 → Detail(/makgeolli/:id) 진입.
export function MyActivity() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selected = parseTab(searchParams.get("tab"));

  const all = useMyAllActivity();
  const liked = useMyReactionActivity("like");
  const disliked = useMyReactionActivity("dislike");
  const comments = useMyCommentActivity();
  const favorites = useFavoriteMakgeollis();
  const decorations = useMyActivityDecorations();

  const favoriteItems = useMemo(
    () => favorites.data?.map((m) => ({ makgeolli: m })),
    [favorites.data],
  );

  // 코멘트 탭 — { comment, makgeolli } → { makgeolli } 어댑트로 단일 렌더 경로 통일.
  const commentItems = useMemo(
    () => comments.data?.map((c) => ({ makgeolli: c.makgeolli })),
    [comments.data],
  );

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

  const goDetail = (makgeolliId: string) =>
    navigate(`/makgeolli/${makgeolliId}`);

  return (
    <main
      className={styles.main}
      style={{
        paddingTop: 16,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
      }}
    >
      <h1 className={styles.title}>내 활동</h1>
      <SubTabHeader selected={selected} onSelect={handleSelect} />

      {selected === "all" && (
        <CardPane
          isLoading={all.isLoading}
          isError={all.isError}
          onRetry={() => all.refetch()}
          items={allWithFavorites}
          decorations={decorations.data}
          onCardClick={goDetail}
        />
      )}
      {selected === "like" && (
        <CardPane
          isLoading={liked.isLoading}
          isError={liked.isError}
          onRetry={() => liked.refetch()}
          items={liked.data}
          decorations={decorations.data}
          onCardClick={goDetail}
        />
      )}
      {selected === "dislike" && (
        <CardPane
          isLoading={disliked.isLoading}
          isError={disliked.isError}
          onRetry={() => disliked.refetch()}
          items={disliked.data}
          decorations={decorations.data}
          onCardClick={goDetail}
        />
      )}
      {selected === "favorite" && (
        <CardPane
          isLoading={favorites.isLoading}
          isError={favorites.isError}
          onRetry={() => favorites.refetch()}
          items={favoriteItems}
          decorations={decorations.data}
          onCardClick={goDetail}
        />
      )}
      {selected === "comment" && (
        <CardPane
          isLoading={comments.isLoading}
          isError={comments.isError}
          onRetry={() => comments.refetch()}
          items={commentItems}
          decorations={decorations.data}
          onCardClick={goDetail}
        />
      )}
    </main>
  );
}
