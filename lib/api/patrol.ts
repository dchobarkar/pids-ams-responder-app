import type { AuthFetchDeps } from "@/lib/api/authenticated-fetch";
import {
  authFetchJson,
  authFetchJsonGet,
  authFetchJsonNoBody,
} from "@/lib/api/authenticated-fetch";
import type {
  PatrolCurrentResponse,
  PatrolPingsBody,
  PatrolPingsResponse,
  PatrolSessionStartResponse,
} from "@/lib/api/types/domain";

export async function postPatrolSession(
  deps: AuthFetchDeps,
): Promise<PatrolSessionStartResponse> {
  return authFetchJson<PatrolSessionStartResponse>(
    "POST",
    "/patrol/sessions",
    {},
    deps,
  );
}

export async function getPatrolCurrent(
  deps: AuthFetchDeps,
): Promise<PatrolCurrentResponse> {
  return authFetchJsonGet<PatrolCurrentResponse>(
    "/patrol/sessions/current",
    deps,
  );
}

export async function postPatrolPings(
  body: PatrolPingsBody,
  deps: AuthFetchDeps,
): Promise<PatrolPingsResponse> {
  return authFetchJson<PatrolPingsResponse>(
    "POST",
    "/patrol/pings",
    body,
    deps,
  );
}

export async function patchPatrolSessionStop(
  sessionId: string,
  deps: AuthFetchDeps,
): Promise<unknown> {
  return authFetchJsonNoBody(
    "PATCH",
    `/patrol/sessions/${sessionId}/stop`,
    deps,
  );
}
