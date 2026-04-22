import type { AuthFetchDeps } from "@/lib/api/authenticated-fetch";
import { authFetchJson, authFetchJsonGet } from "@/lib/api/authenticated-fetch";
import type {
  AlarmDetailResponse,
  AlarmListResponse,
  AlarmSummary,
} from "@/lib/api/types/domain";

export type AlarmListParams = {
  page?: number;
  pageSize?: number;
  status?: string;
};

export function buildAlarmQuery(params: AlarmListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
  if (params.status) q.set("status", params.status);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function getAlarms(
  params: AlarmListParams,
  deps: AuthFetchDeps,
): Promise<AlarmListResponse> {
  return authFetchJsonGet<AlarmListResponse>(
    `/alarms${buildAlarmQuery(params)}`,
    deps,
  );
}

export async function getAlarmById(
  alarmId: string,
  deps: AuthFetchDeps,
): Promise<AlarmDetailResponse> {
  return authFetchJsonGet<AlarmDetailResponse>(`/alarms/${alarmId}`, deps);
}

export async function postAlarmSelfAssign(
  alarmId: string,
  deps: AuthFetchDeps,
): Promise<unknown> {
  return authFetchJson("POST", `/alarms/${alarmId}/self-assign`, {}, deps);
}

export function normalizeAlarmList(res: AlarmListResponse): AlarmSummary[] {
  return res.items ?? res.alarms ?? res.data ?? [];
}
