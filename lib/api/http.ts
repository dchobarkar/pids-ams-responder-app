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
    const hint =
      e instanceof TypeError
        ? `Cannot reach configured API base ${base}. Verify EXPO_PUBLIC_API_BASE_URL, backend availability, and Expo Web CORS settings if applicable. (${e.message})`
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
