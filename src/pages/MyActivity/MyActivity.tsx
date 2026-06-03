import { Fragment, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MakgeolliGridCard } from "@/features/makgeolli-list";
import {
  useMyAllActivity,
  useMyReactionActivity,
  useMyCommentActivity,
} from "@/features/my-activity";
import { useFavoriteMakgeollis } from "@/features/favorites";
import {
  CommentActionSheet,
  CommentEditorSheet,
  DeleteConfirmDialog,
  useSaveMyComment,
  useDeleteMyComment,
} from "@/features/my-comment";
import { CommentRow } from "@/shared/ui/CommentRow";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { SubTabHeader, type ActivityTab } from "./SubTabHeader";
import type { UserComment } from "@/shared/types/user-comment";
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

type CommentSheetState =
  | { kind: "none" }
  | { kind: "action"; comment: UserComment }
  | { kind: "edit"; comment: UserComment }
  | { kind: "confirm-delete"; comment: UserComment };

// /my-activity — iOS MyMakgeolliView 미러. 4 sub-탭(전체/좋아요/싫어요/코멘트).
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

  // comment 탭의 ActionSheet/Editor/ConfirmDialog 진입 상태.
  // 행 클릭이 ActionSheet 를 열고, 거기서 수정/삭제 분기.
  const [sheet, setSheet] = useState<CommentSheetState>({ kind: "none" });
  const activeMakgeolliId =
    sheet.kind === "none" ? "" : sheet.comment.makgeolli_id;
  const saveComment = useSaveMyComment(activeMakgeolliId);
  const deleteComment = useDeleteMyComment(activeMakgeolliId);

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
                    onClick={() =>
                      setSheet({ kind: "action", comment: item.comment })
                    }
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

      <CommentActionSheet
        open={sheet.kind === "action"}
        onEdit={() =>
          sheet.kind === "action" &&
          setSheet({ kind: "edit", comment: sheet.comment })
        }
        onDelete={() =>
          sheet.kind === "action" &&
          setSheet({ kind: "confirm-delete", comment: sheet.comment })
        }
        onCancel={() => setSheet({ kind: "none" })}
      />
      <CommentEditorSheet
        open={sheet.kind === "edit"}
        mode="edit"
        initialContent={
          sheet.kind === "edit" ? sheet.comment.comment : undefined
        }
        initialIsPublic={
          sheet.kind === "edit" ? sheet.comment.is_public : undefined
        }
        onSubmit={async (input) => {
          await saveComment.save(input);
          setSheet({ kind: "none" });
        }}
        onCancel={() => setSheet({ kind: "none" })}
      />
      <DeleteConfirmDialog
        open={sheet.kind === "confirm-delete"}
        onConfirm={async () => {
          await deleteComment.delete();
          setSheet({ kind: "none" });
        }}
        onCancel={() => setSheet({ kind: "none" })}
      />
    </main>
  );
}
