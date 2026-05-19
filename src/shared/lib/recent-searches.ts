import { Storage } from "@apps-in-toss/web-framework";

const STORAGE_KEY = "julook:recent-searches";

export async function loadRecentSearches(): Promise<string[]> {
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

export async function saveRecentSearches(items: string[]): Promise<void> {
  await Storage.setItem(STORAGE_KEY, JSON.stringify(items));
}
