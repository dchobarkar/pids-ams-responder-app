import type { AuthFetchDeps } from "@/lib/api/authenticated-fetch";
import {
  authFetchJsonGet,
  authFetchJsonNoBody,
} from "@/lib/api/authenticated-fetch";
import type {
  NotificationItem,
  NotificationListResponse,
} from "@/lib/api/types/domain";

export async function getNotifications(
  deps: AuthFetchDeps,
): Promise<NotificationListResponse> {
  return authFetchJsonGet<NotificationListResponse>("/notifications", deps);
}

export async function postNotificationRead(
  id: string,
  deps: AuthFetchDeps,
): Promise<unknown> {
  return authFetchJsonNoBody("POST", `/notifications/${id}/read`, deps);
}

export async function postNotificationsReadAll(
  deps: AuthFetchDeps,
): Promise<unknown> {
  return authFetchJsonNoBody("POST", "/notifications/read-all", deps);
}

export function normalizeNotificationList(
  res: NotificationListResponse,
): NotificationItem[] {
  return res.items ?? res.notifications ?? [];
}
