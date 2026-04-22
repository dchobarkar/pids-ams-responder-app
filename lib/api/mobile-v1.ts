import type { AuthFetchDeps } from "@/lib/api/authenticated-fetch";
import {
  authFetchJsonGet,
  authFetchJsonNoBody,
} from "@/lib/api/authenticated-fetch";
import { fetchJson, mobileUrl, parseSuccessJson } from "@/lib/api/http";
import type { LoginResponse, ProfileResponse } from "@/lib/api/types";

export type LoginBody = {
  email: string;
  password: string;
  installId: string;
  deviceName?: string;
  platform?: string;
  appVersion?: string;
};

export async function postLogin(body: LoginBody): Promise<LoginResponse> {
  const response = await fetchJson(mobileUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseSuccessJson<LoginResponse>(response);
}

export async function postRefresh(
  refreshToken: string,
): Promise<LoginResponse> {
  const response = await fetchJson(mobileUrl("/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  return parseSuccessJson<LoginResponse>(response);
}

export async function getProfile(
  deps: AuthFetchDeps,
): Promise<ProfileResponse> {
  return authFetchJsonGet<ProfileResponse>("/profile", deps);
}

export async function postLogout(deps: AuthFetchDeps): Promise<void> {
  await authFetchJsonNoBody<{ success: boolean }>("POST", "/auth/logout", deps);
}

export type { AuthFetchDeps } from "@/lib/api/authenticated-fetch";
export type { MobileUser } from "@/lib/api/types";
