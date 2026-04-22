import type { MobileUser } from "@/lib/api/types";

/** Loose shapes — align with backend responses as you integrate. */

export type PatrolSessionInfo = {
  sessionId: string;
  startedAt: string;
  intervalSeconds?: number;
  lastRecordedAt?: string | null;
};

export type BootstrapResponse = {
  user?: MobileUser;
  capabilities?: Record<string, boolean>;
  chainageSummary?: unknown;
  activePatrolSession?: PatrolSessionInfo | null;
  unreadNotificationCount?: number;
};

export type AlarmActionFlags = {
  canAcknowledge?: boolean;
  canSelfAssign?: boolean;
  canAssign?: boolean;
  canAcceptAssignment?: boolean;
  canVerify?: boolean;
};

export type AlarmSummary = AlarmActionFlags &
  Record<string, unknown> & {
    id: string;
  };

export type AlarmListResponse = {
  items?: AlarmSummary[];
  alarms?: AlarmSummary[];
  data?: AlarmSummary[];
  page?: number;
  pageSize?: number;
  total?: number;
};

export type AlarmDetailResponse = {
  alarm: AlarmSummary & Record<string, unknown>;
};

export type TaskSummary = AlarmActionFlags & {
  id: string;
  assignmentId?: string;
  [key: string]: unknown;
};

export type TaskListResponse = {
  items?: TaskSummary[];
  tasks?: TaskSummary[];
  data?: TaskSummary[];
  page?: number;
  pageSize?: number;
  total?: number;
};

export type NotificationItem = {
  id: string;
  read?: boolean;
  [key: string]: unknown;
};

export type NotificationListResponse = {
  items?: NotificationItem[];
  notifications?: NotificationItem[];
};

export type PatrolSessionStartResponse = PatrolSessionInfo;

export type PatrolCurrentResponse = {
  session: PatrolSessionInfo | null;
};

export type PatrolPingsBody = {
  sessionId: string;
  points: {
    clientPointId: string;
    recordedAt: string;
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    source?: string;
  }[];
};

export type PatrolPingsResponse = {
  success?: boolean;
  acceptedCount?: number;
  lastRecordedAt?: string;
};

export type AssigneeOption = {
  id: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
};

export type AssigneeOptionsResponse = {
  options?: AssigneeOption[];
  assignees?: AssigneeOption[];
};
