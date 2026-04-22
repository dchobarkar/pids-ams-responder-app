import type { AuthFetchDeps } from "@/lib/api/authenticated-fetch";
import { authFetchJsonGet } from "@/lib/api/authenticated-fetch";
import type { TaskListResponse, TaskSummary } from "@/lib/api/types/domain";

export type TaskListParams = {
  scope: "my" | "visible";
  page?: number;
  pageSize?: number;
};

export function buildTaskQuery(params: TaskListParams): string {
  const q = new URLSearchParams();
  q.set("scope", params.scope);
  if (params.page != null) q.set("page", String(params.page));
  if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
  return `?${q.toString()}`;
}

export async function getTasks(
  params: TaskListParams,
  deps: AuthFetchDeps,
): Promise<TaskListResponse> {
  return authFetchJsonGet<TaskListResponse>(
    `/tasks${buildTaskQuery(params)}`,
    deps,
  );
}

export function normalizeTaskList(res: TaskListResponse): TaskSummary[] {
  return res.items ?? res.tasks ?? res.data ?? [];
}
