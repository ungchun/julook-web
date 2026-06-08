import styles from "./RegisterRequestDialog.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

// 등록 요청 완료 alert — iOS L10n.Search.Results.RequestComplete 미러.
// 단일 "확인" 버튼 + backdrop 클릭으로도 닫힘.
export function RegisterRequestDialog({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.title}>등록 요청 완료</h2>
        <p className={styles.body}>빠른 시일내에 추가할게요!</p>
        <button
          type="button"
          className={styles.confirmButton}
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
}
