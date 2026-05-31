import { useEffect, useState } from "react";
import { getMakgeolliImageUrl } from "@/shared/lib/makgeolli-image";

const FALLBACK_SRC = "/assets/placeholder/default_makgeolli.svg";
const MAX_RETRY = 1;

type Props = {
  imageName: string | null;
  alt: string;
  className?: string;
};

// 본앱 AsyncImage 미러 — 로드 실패 시 1회 cache-buster 재시도, 그래도 실패면
// DesignSystemAsset.Images.defaultMakgeolli 자산(public/assets/placeholder/default_makgeolli.svg)으로 fallback.
// imageName이 null이면 즉시 fallback.
export function MakgeolliImage({ imageName, alt, className }: Props) {
  const baseUrl = getMakgeolliImageUrl(imageName);
  const [retry, setRetry] = useState(0);
  const [failed, setFailed] = useState(baseUrl == null);

  useEffect(() => {
    setRetry(0);
    setFailed(baseUrl == null);
  }, [baseUrl]);

  const src = failed
    ? FALLBACK_SRC
    : retry === 0
      ? baseUrl!
      : `${baseUrl}?retry=${retry}`;

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      onError={() => {
        if (failed) return;
        if (retry < MAX_RETRY) {
          setRetry((n) => n + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
