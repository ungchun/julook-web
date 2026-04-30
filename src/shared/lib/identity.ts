import { Storage } from "@apps-in-toss/web-framework";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "julook:user-id";

let cached: string | null = null;

export async function getOrCreateUserId(): Promise<string> {
  if (cached !== null) return cached;

  const existing = await Storage.getItem(STORAGE_KEY);
  if (existing !== null) {
    cached = existing;
    return existing;
  }

  const fresh = uuidv4();
  await Storage.setItem(STORAGE_KEY, fresh);
  cached = fresh;
  return fresh;
}
