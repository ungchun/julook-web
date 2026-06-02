import { Storage } from "@apps-in-toss/web-framework";

// iOS MyMakgeolliLocal.isFavorite 의 Web 대응 — Apps in Toss Storage 에
// makgeolliId 배열을 JSON 직렬화로 저장. 디바이스 단위 영속이며 디바이스 변경 시 소실
// (Reactions / 코멘트와 동일한 사용자 식별 한계 — 사용자 결정).
const STORAGE_KEY = "julook:favorites";

export async function loadFavorites(): Promise<string[]> {
  const raw = await Storage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string")) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveFavorites(ids: string[]): Promise<void> {
  await Storage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
