import { useState } from "react";
import { formatDateYMD } from "@/shared/lib/format-date";
import { LoadingState } from "@/shared/ui/LoadingState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useMyComment } from "./use-my-comment";
import { useSaveMyComment } from "./use-save-my-comment";
import { useDeleteMyComment } from "./use-delete-my-comment";
import { CommentEditorSheet } from "./CommentEditorSheet";
import { CommentActionSheet } from "./CommentActionSheet";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import styles from "./MyCommentSection.module.css";

type Props = {
  makgeolliId: string | undefined;
};

type SheetState =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit" }
  | { kind: "action" }
  | { kind: "confirm-delete" };

// Detail 페이지의 "내 코멘트" 섹션. iOS InformationView 내 코멘트 진입점 미러.
// - 코멘트 없음 → 빈 CTA 박스 (전체 박스 = 버튼) → CommentEditorSheet(mode=create)
// - 코멘트 있음 → 본문 + 날짜 + 공개 라벨 + "수정" 버튼 → CommentActionSheet → edit/delete 분기
export function MyCommentSection({ makgeolliId }: Props) {
  const { data, isLoading, isError, refetch } = useMyComment(makgeolliId);
  const save = useSaveMyComment(makgeolliId ?? "");
  const remove = useDeleteMyComment(makgeolliId ?? "");
  const [sheet, setSheet] = useState<SheetState>({ kind: "none" });

  if (makgeolliId == null) return null;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <span className={styles.label}>내 코멘트</span>
        {data != null && (
          <span className={styles.visibility}>
            {data.is_public ? "전체공개" : "비공개"}
          </span>
        )}
      </header>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <LoadingState />
      ) : data == null ? (
        <button
          type="button"
          className={styles.emptyBox}
          onClick={() => setSheet({ kind: "create" })}
        >
          터치해서 코멘트를 남겨보세요!
        </button>
      ) : (
        <>
          <div className={styles.commentBox}>
            <p className={styles.commentBody}>{data.comment}</p>
          </div>
          <div className={styles.footer}>
            <span className={styles.date}>
              {formatDateYMD(data.created_at)}
            </span>
            <button
              type="button"
              className={styles.editButton}
              onClick={() => setSheet({ kind: "action" })}
            >
              수정
            </button>
          </div>
        </>
      )}

      <CommentEditorSheet
        open={sheet.kind === "create"}
        mode="create"
        onSubmit={async (input) => {
          await save.save(input);
          setSheet({ kind: "none" });
        }}
        onCancel={() => setSheet({ kind: "none" })}
      />
      <CommentEditorSheet
        open={sheet.kind === "edit"}
        mode="edit"
        initialContent={data?.comment}
        initialIsPublic={data?.is_public}
        onSubmit={async (input) => {
          await save.save(input);
          setSheet({ kind: "none" });
        }}
        onCancel={() => setSheet({ kind: "none" })}
      />
      <CommentActionSheet
        open={sheet.kind === "action"}
        onEdit={() => setSheet({ kind: "edit" })}
        onDelete={() => setSheet({ kind: "confirm-delete" })}
        onCancel={() => setSheet({ kind: "none" })}
      />
      <DeleteConfirmDialog
        open={sheet.kind === "confirm-delete"}
        onConfirm={async () => {
          await remove.delete();
          setSheet({ kind: "none" });
        }}
        onCancel={() => setSheet({ kind: "none" })}
      />
    </section>
  );
}
