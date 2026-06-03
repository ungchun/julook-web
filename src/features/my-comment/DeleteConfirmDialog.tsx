import styles from "./DeleteConfirmDialog.module.css";

type Props = {
  open: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

// iOS L10n.Information.Comment.DeleteAlert 미러.
// 단일 confirm 다이얼로그 — 본문 한 줄 + 취소/삭제 버튼.
export function DeleteConfirmDialog({ open, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className={styles.backdrop} role="presentation">
      <div role="dialog" aria-modal="true" className={styles.dialog}>
        <h2 className={styles.title}>코멘트 삭제</h2>
        <p className={styles.body}>정말 삭제할까요?</p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => void onConfirm()}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
