import type { MobileUser } from "@/lib/api/types";
import {
  safeDeleteItem,
  safeGetItem,
  safeSetItem,
} from "@/lib/auth/safe-storage";

const PREFIX = "pids_ams_";

const KEYS = {
  refreshToken: `${PREFIX}refresh_token`,
  accessToken: `${PREFIX}access_token`,
  expiresAt: `${PREFIX}expires_at`,
  userJson: `${PREFIX}user_json`,
} as const;

export async function loadStoredSession(): Promise<{
  refreshToken: string | null;
  accessToken: string | null;
  expiresAt: string | null;
  user: MobileUser | null;
}> {
  const [refreshToken, accessToken, expiresAt, userJson] = await Promise.all([
    safeGetItem(KEYS.refreshToken),
    safeGetItem(KEYS.accessToken),
    safeGetItem(KEYS.expiresAt),
    safeGetItem(KEYS.userJson),
  ]);

  let user: MobileUser | null = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson) as MobileUser;
    } catch {
      user = null;
    }
  }

  return { refreshToken, accessToken, expiresAt, user };
}

export async function saveSession(params: {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: MobileUser;
}): Promise<void> {
  await Promise.all([
    safeSetItem(KEYS.accessToken, params.accessToken),
    safeSetItem(KEYS.refreshToken, params.refreshToken),
    safeSetItem(KEYS.expiresAt, params.expiresAt),
    safeSetItem(KEYS.userJson, JSON.stringify(params.user)),
  ]);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    safeDeleteItem(KEYS.accessToken),
    safeDeleteItem(KEYS.refreshToken),
    safeDeleteItem(KEYS.expiresAt),
    safeDeleteItem(KEYS.userJson),
  ]);
}

export function isAccessExpired(
  expiresAtIso: string,
  bufferMs = 60_000,
): boolean {
  const t = Date.parse(expiresAtIso);
  if (Number.isNaN(t)) {
    return true;
  }
  return t - bufferMs <= Date.now();
}
