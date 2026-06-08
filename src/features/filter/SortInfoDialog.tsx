import type { SortOption } from "./sort";
import styles from "./SortInfoDialog.module.css";

type Props = {
  open: boolean;
  sort: SortOption;
  onClose: () => void;
};

const INFO_BY_SORT: Record<SortOption, { title: string; body: string }> = {
  recommended: {
    title: "추천순으로 정렬",
    body: "최근에 나온 막걸리일수록 리스트 상단에 정렬돼요.",
  },
  highAlcohol: {
    title: "높은 도수순으로 정렬",
    body: "도수가 높은 막걸리일수록 리스트 상단에 정렬돼요.",
  },
  lowAlcohol: {
    title: "낮은 도수순으로 정렬",
    body: "도수가 낮은 막걸리일수록 리스트 상단에 정렬돼요.",
  },
};

// 현재 정렬 기준 설명 alert. 확인 버튼 단일.
export function SortInfoDialog({ open, sort, onClose }: Props) {
  if (!open) return null;
  const info = INFO_BY_SORT[sort];

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.title}>{info.title}</h2>
        <p className={styles.body}>{info.body}</p>
        <button type="button" className={styles.confirmButton} onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}
