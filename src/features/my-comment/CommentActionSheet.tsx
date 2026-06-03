import styles from "./CommentActionSheet.module.css";

type Props = {
  open: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
};

// 모바일 BottomSheet — iOS UIActionSheet 미러.
// 수정하기 / 삭제하기(destructive) / 취소.
export function CommentActionSheet({
  open,
  onEdit,
  onDelete,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className={styles.backdrop} role="presentation" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.action}
            onClick={onEdit}
          >
            수정하기
          </button>
          <div className={styles.divider} />
          <button
            type="button"
            className={styles.destructiveAction}
            onClick={onDelete}
          >
            삭제하기
          </button>
        </div>
        <button
          type="button"
          className={styles.cancelAction}
          onClick={onCancel}
        >
          취소
        </button>
      </div>
    </div>
  );
}
