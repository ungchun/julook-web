import { useEffect, useState } from "react";
import { getOrCreateUserId } from "./identity";

// userId 는 디바이스 단위. getOrCreateUserId 는 비동기라 React state 로 한 번 로드.
// reaction / my-activity 등 user 식별이 필요한 hook 들의 공통 의존.
export function useUserId(): string | undefined {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    getOrCreateUserId().then((id) => {
      if (alive) setUserId(id);
    });
    return () => {
      alive = false;
    };
  }, []);
  return userId;
}
