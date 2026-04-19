import { getApiBaseUrl, MOBILE_V1_PATH } from "@/lib/api/config";
import { ApiError, parseErrorResponse } from "@/lib/api/errors";

export function mobileUrl(path: string): string {
  return `${getApiBaseUrl()}${MOBILE_V1_PATH}${path}`;
}

export async function fetchJson(
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

export async function parseSuccessJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  return response.json() as Promise<T>;
}
