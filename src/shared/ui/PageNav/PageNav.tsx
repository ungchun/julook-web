import styles from "./PageNav.module.css";

type Props = {
  onClose: () => void;
};

// Filter / Awards / AllComments 페이지 공통 nav — 좌측 닫기 버튼.
// Detail 페이지 nav 는 우측 닫기 + 다른 height/margin 이라 별도.
export function PageNav({ onClose }: Props) {
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
    </nav>
  );
}
