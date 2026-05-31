import styles from "./PageNav.module.css";

type Props = {
  onClose: () => void;
  /** iOS UINavigationBar 중앙 타이틀 미러. 미지정 시 close 버튼만. */
  title?: string;
};

// Filter / Awards / AllComments 페이지 공통 nav.
// 좌측 닫기 + (옵션) 중앙 title — iOS .addNavigationBar(title:) 미러.
export function PageNav({ onClose, title }: Props) {
  return (
    <nav className={styles.navBar}>
      <button
        type="button"
        className={styles.closeButton}
        aria-label="닫기"
        onClick={onClose}
      >
        <img className={styles.closeIcon} src="/assets/icon/close.svg" alt="" />
      </button>
      {title != null && <h1 className={styles.title}>{title}</h1>}
    </nav>
  );
}
