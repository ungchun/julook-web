import { useEffect, useRef } from "react";

type Props = {
  onIntersect: () => void;
};

// viewport 진입을 감지해 onIntersect 호출. IntersectionObserver 기반 무한 스크롤
// 트리거. 결과 그리드 끝에 두고 hasMore && loadMore 패턴과 결합한다.
export function InfiniteListSentinel({ onIntersect }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onIntersect);

  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const node = ref.current;
    if (node == null) return;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first?.isIntersecting) {
        callbackRef.current();
      }
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  return <div ref={ref} data-testid="infinite-sentinel" aria-hidden="true" />;
}
