import { useEffect, useState } from "react";
import { getMakgeolliImageUrl } from "@/shared/lib/makgeolli-image";
import styles from "./MakgeolliImage.module.css";

const FALLBACK_SRC = "/assets/placeholder/default_makgeolli.svg";
const MAX_RETRY = 1;

type Props = {
  imageName: string | null;
  alt: string;
  className?: string;
};

// 본앱 AsyncImage 미러 — 로드 실패 시 1회 cache-buster 재시도, 그래도 실패면
// DesignSystemAsset.Images.defaultMakgeolli (public/assets/placeholder/default_makgeolli.svg)로 fallback.
// 로딩 중에는 iOS ProgressView 미러로 spinner overlay 표시.
export function MakgeolliImage({ imageName, alt, className }: Props) {
  const baseUrl = getMakgeolliImageUrl(imageName);
  const [retry, setRetry] = useState(0);
  const [failed, setFailed] = useState(baseUrl == null);
  // imageName null → 즉시 fallback 이라 spinner 불필요. baseUrl 있으면 로딩 표시.
  const [loaded, setLoaded] = useState(baseUrl == null);

  useEffect(() => {
    setRetry(0);
    setFailed(baseUrl == null);
    setLoaded(baseUrl == null);
  }, [baseUrl]);

  const src = failed
    ? FALLBACK_SRC
    : retry === 0
      ? baseUrl!
      : `${baseUrl}?retry=${retry}`;

  return (
    <>
      {!loaded && (
        <span
          className={styles.spinner}
          role="status"
          aria-label="이미지 로딩 중"
        />
      )}
      <img
        className={className}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (failed) {
            setLoaded(true);
            return;
          }
          if (retry < MAX_RETRY) {
            setRetry((n) => n + 1);
          } else {
            setFailed(true);
            setLoaded(true);
          }
        }}
      />
    </>
  );
}
