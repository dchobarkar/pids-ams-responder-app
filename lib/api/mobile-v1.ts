import { getApiBaseUrl, MOBILE_V1_PATH } from "@/lib/api/config";
import { ApiError, parseErrorResponse } from "@/lib/api/errors";
import type { LoginResponse, ProfileResponse } from "@/lib/api/types";

function url(path: string): string {
  return `${getApiBaseUrl()}${MOBILE_V1_PATH}${path}`;
}

async function fetchJson(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (e) {
    const base = getApiBaseUrl();
    const corsHelp =
      " Expo Web: either add CORS headers on your Next.js `/api/*` routes, or run `npm run dev:api-proxy` and set EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3333";
    const hint =
      e instanceof TypeError
        ? `Cannot reach ${base}. Is the API running on that host/port? Set EXPO_PUBLIC_API_BASE_URL if the API is elsewhere.${corsHelp} (${e.message})`
        : e instanceof Error
          ? e.message
          : String(e);
    throw new ApiError("NETWORK", hint, 0);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  return response.json() as Promise<T>;
}

export type LoginBody = {
  email: string;
  password: string;
  installId: string;
  deviceName?: string;
  platform?: string;
  appVersion?: string;
};

export async function postLogin(body: LoginBody): Promise<LoginResponse> {
  const response = await fetchJson(url("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<LoginResponse>(response);
}

export async function postRefresh(
  refreshToken: string,
): Promise<LoginResponse> {
  const response = await fetchJson(url("/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  return parseJson<LoginResponse>(response);
}

/**
 * Runs an authenticated GET; on 401, calls onUnauthorized to obtain a new access token and retries once.
 */
export async function getProfileWithRetry(
  accessToken: string,
  onUnauthorized: () => Promise<string | null>,
): Promise<ProfileResponse> {
  const first = await fetchJson(url("/profile"), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (first.status === 401) {
    const next = await onUnauthorized();
    if (!next) {
      throw new ApiError("UNAUTHORIZED", "Session expired", 401);
    }
    const second = await fetchJson(url("/profile"), {
      method: "GET",
      headers: { Authorization: `Bearer ${next}` },
    });
    return parseJson<ProfileResponse>(second);
  }

  return parseJson<ProfileResponse>(first);
}

export async function postLogoutWithRetry(
  accessToken: string,
  onUnauthorized: () => Promise<string | null>,
): Promise<void> {
  const first = await fetchJson(url("/auth/logout"), {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (first.ok) return;

  if (first.status === 401) {
    const next = await onUnauthorized();
    if (!next) throw await parseErrorResponse(first);

    const second = await fetchJson(url("/auth/logout"), {
      method: "POST",
      headers: { Authorization: `Bearer ${next}` },
    });
    if (!second.ok) {
      throw await parseErrorResponse(second);
    }
    return;
  }

  throw await parseErrorResponse(first);
}

export type { MobileUser } from "@/lib/api/types";
