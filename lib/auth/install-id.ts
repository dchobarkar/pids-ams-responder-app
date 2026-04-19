import { safeGetItem, safeSetItem } from "@/lib/auth/safe-storage";

const KEY = "pids_ams_install_id";

let cached: string | null = null;

function randomUuidV4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Stable installation id for mobile API login (1–200 chars per contract).
 */
export async function getInstallId(): Promise<string> {
  if (cached) return cached;

  let id = await safeGetItem(KEY);
  if (!id) {
    id = randomUuidV4();
    await safeSetItem(KEY, id);
  }
  cached = id;
  return id;
}
