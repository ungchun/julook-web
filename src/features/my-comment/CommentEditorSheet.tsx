import { useState, type ChangeEvent } from "react";
import styles from "./CommentEditorSheet.module.css";

type Props = {
  mode: "create" | "edit";
  initialContent?: string;
  initialIsPublic?: boolean;
  onSubmit: (input: { comment: string; isPublic: boolean }) => Promise<void> | void;
  onCancel: () => void;
};

const MAX_LENGTH = 200;
const PLACEHOLDER = "막걸리에 대한 생각을 자유롭게 적어주세요.";

// 전체 화면 sheet — iOS .sheet modifier + CommentSheetView 미러.
// 폼 상태(text, isPublic) 는 useState 로컬. 저장 시점에 onSubmit 콜백.
// 시트 표시 여부는 호출부의 conditional render 로 통제 (mount/unmount 사이클이
// iOS .sheet(isPresented:) 의 자연 mount 동작을 미러). 그래야 매번 새 mount 시점에
// initialContent / initialIsPublic 가 useState 초기값으로 반영된다.
export function CommentEditorSheet({
  mode,
  initialContent,
  initialIsPublic,
  onSubmit,
  onCancel,
}: Props) {
  const [text, setText] = useState(initialContent ?? "");
  // 비공개 체크박스: checked === !isPublic. 기본값 = 전체공개 (isPublic=true).
  const [isPublic, setIsPublic] = useState(initialIsPublic ?? true);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    // iOS prefix(200) 미러 — 입력 시점에 hard limit.
    setText(e.target.value.slice(0, MAX_LENGTH));
  };

  const togglePrivate = () => {
    setIsPublic((prev) => !prev);
  };

  const disabled = text.trim().length === 0 || saving;

  const handleSave = async () => {
    if (disabled) return;
    setSaving(true);
    try {
      await onSubmit({ comment: text, isPublic });
    } finally {
      setSaving(false);
    }
  };

  const title = mode === "create" ? "코멘트 남기기" : "코멘트 수정";

  return (
    <div role="dialog" aria-modal="true" className={styles.sheet}>
      <nav className={styles.navBar}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
        >
          취소
        </button>
        <span className={styles.title}>{title}</span>
        <button
          type="button"
          className={disabled ? styles.saveButtonDisabled : styles.saveButton}
          onClick={() => void handleSave()}
          disabled={disabled}
        >
          저장
        </button>
      </nav>

      <div className={styles.body}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={handleChange}
          placeholder={PLACEHOLDER}
          maxLength={MAX_LENGTH}
        />
        <div className={styles.divider} />
        <label className={styles.privacyRow}>
          <span className={styles.privacyLabel}>비공개</span>
          <input
            type="checkbox"
            className={styles.privacyCheckbox}
            checked={!isPublic}
            onChange={togglePrivate}
          />
        </label>
      </div>
    </div>
  );
}
