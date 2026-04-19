import type { AuthFetchDeps } from "@/lib/api/authenticated-fetch";
import {
  authFetchFormData,
  authFetchJson,
  authFetchJsonGet,
} from "@/lib/api/authenticated-fetch";
import type { AssigneeOptionsResponse } from "@/lib/api/types/domain";

export async function getAssigneeOptions(
  alarmId: string,
  deps: AuthFetchDeps,
): Promise<AssigneeOptionsResponse> {
  return authFetchJsonGet<AssigneeOptionsResponse>(
    `/alarms/${alarmId}/assignee-options`,
    deps,
  );
}

export type CreateAssignmentBody = {
  assigneeUserId: string;
  [key: string]: unknown;
};

export async function postAlarmAssignment(
  alarmId: string,
  body: CreateAssignmentBody,
  deps: AuthFetchDeps,
): Promise<unknown> {
  return authFetchJson("POST", `/alarms/${alarmId}/assignments`, body, deps);
}

export async function postAcceptAssignment(
  assignmentId: string,
  deps: AuthFetchDeps,
): Promise<unknown> {
  return authFetchJson("POST", `/assignments/${assignmentId}/accept`, {}, deps);
}

export async function postAlarmAcknowledgement(
  alarmId: string,
  formData: FormData,
  deps: AuthFetchDeps,
): Promise<unknown> {
  return authFetchFormData(
    `/alarms/${alarmId}/acknowledgements`,
    formData,
    deps,
  );
}

export async function postAlarmVerification(
  alarmId: string,
  formData: FormData,
  deps: AuthFetchDeps,
): Promise<unknown> {
  return authFetchFormData(`/alarms/${alarmId}/verifications`, formData, deps);
}
