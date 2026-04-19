/** Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) vs IPv4 listen mismatches. */
const DEFAULT_DEV_BASE = "http://127.0.0.1:3000";

export function getApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");

  return DEFAULT_DEV_BASE;
}

export const MOBILE_V1_PATH = "/api/mobile/v1";
