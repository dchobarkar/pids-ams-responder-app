import { ApiError } from "@/lib/api/errors";
import { fetchJson, mobileUrl, parseSuccessJson } from "@/lib/api/http";

export type AuthFetchDeps = {
  getValidAccessToken: () => Promise<string | null>;
  refreshAccessToken: () => Promise<string | null>;
};

/**
 * JSON request with Bearer token; on 401 refreshes once and retries.
 */
export async function authFetchJson<T>(
  method: string,
  path: string,
  body: unknown | undefined,
  deps: AuthFetchDeps,
): Promise<T> {
  let token = await deps.getValidAccessToken();
  if (!token) {
    throw new ApiError("UNAUTHORIZED", "Not signed in", 401);
  }

  const isGet = method === "GET" || method === "HEAD";
  const buildInit = (access: string): RequestInit => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${access}`,
    };
    if (!isGet && body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    const init: RequestInit = { method, headers };
    if (!isGet && body !== undefined) {
      init.body = JSON.stringify(body);
    }
    return init;
  };

  let res = await fetchJson(mobileUrl(path), buildInit(token));

  if (res.status === 401) {
    const next = await deps.refreshAccessToken();
    if (!next) {
      throw new ApiError("UNAUTHORIZED", "Session expired", 401);
    }
    res = await fetchJson(mobileUrl(path), buildInit(next));
  }

  return parseSuccessJson<T>(res);
}

/**
 * GET with query string (path includes ?…).
 */
export async function authFetchJsonGet<T>(
  pathWithQuery: string,
  deps: AuthFetchDeps,
): Promise<T> {
  let token = await deps.getValidAccessToken();
  if (!token) {
    throw new ApiError("UNAUTHORIZED", "Not signed in", 401);
  }

  let res = await fetchJson(mobileUrl(pathWithQuery), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const next = await deps.refreshAccessToken();
    if (!next) {
      throw new ApiError("UNAUTHORIZED", "Session expired", 401);
    }
    res = await fetchJson(mobileUrl(pathWithQuery), {
      method: "GET",
      headers: { Authorization: `Bearer ${next}` },
    });
  }

  return parseSuccessJson<T>(res);
}

/**
 * multipart/form-data POST (do not set Content-Type — runtime sets boundary).
 */
export async function authFetchFormData<T>(
  path: string,
  formData: FormData,
  deps: AuthFetchDeps,
): Promise<T> {
  let token = await deps.getValidAccessToken();
  if (!token) {
    throw new ApiError("UNAUTHORIZED", "Not signed in", 401);
  }

  let res = await fetchJson(mobileUrl(path), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (res.status === 401) {
    const next = await deps.refreshAccessToken();
    if (!next) {
      throw new ApiError("UNAUTHORIZED", "Session expired", 401);
    }
    res = await fetchJson(mobileUrl(path), {
      method: "POST",
      headers: { Authorization: `Bearer ${next}` },
      body: formData,
    });
  }

  return parseSuccessJson<T>(res);
}

/**
 * PATCH / POST without JSON body (e.g. empty body).
 */
export async function authFetchJsonNoBody<T>(
  method: "POST" | "PATCH",
  path: string,
  deps: AuthFetchDeps,
): Promise<T> {
  return authFetchJson<T>(method, path, undefined, deps);
}
