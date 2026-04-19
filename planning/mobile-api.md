# Mobile API v1

The Expo responder app talks only to `/api/mobile/v1/*`.

## Auth flow

1. `POST /api/mobile/v1/auth/login`
2. Store `accessToken` and `refreshToken` securely on-device.
3. Send `Authorization: Bearer <accessToken>` on every protected request.
4. If a protected request returns `401`, call `POST /api/mobile/v1/auth/refresh`.
5. Replace both tokens with the rotated response.
6. On sign-out, call `POST /api/mobile/v1/auth/logout`.

Only field roles can sign in through the mobile API:

- `SUPERVISOR`
- `RMP`
- `QRV`
- `NPV`
- `ER`

Other roles receive:

`Mobile app access is available only for responders and supervisors.`

## Common rules

- Base namespace: `/api/mobile/v1`
- Runtime auth: bearer token only, not NextAuth cookies
- Error shape:

```json
{
  "error": {
    "code": "SOME_CODE",
    "message": "Human-readable message.",
    "fieldErrors": {
      "fieldName": "Validation message"
    }
  }
}
```

- Every response includes `X-Request-Id`
- Expo Web can use CORS through `MOBILE_API_CORS_ALLOWED_ORIGINS`

## Protected endpoints

### Profile and bootstrap

- `GET /api/mobile/v1/profile`
- `GET /api/mobile/v1/bootstrap`

Bootstrap returns:

- current mobile user summary
- capability flags
- mapped chainage summary
- active patrol session summary
- unread notification count

### Patrol and GPS

- `POST /api/mobile/v1/patrol/sessions`
- `GET /api/mobile/v1/patrol/sessions/current`
- `POST /api/mobile/v1/patrol/pings`
- `PATCH /api/mobile/v1/patrol/sessions/:id/stop`

Offline support is limited to patrol ping batching only:

- queue pings locally while offline
- replay them later through `POST /patrol/pings`
- keep `clientPointId` stable per captured point

Workflow mutations such as assignment, acknowledgement, and verification are still online-only in v1.

### Alarm reads

- `GET /api/mobile/v1/alarms?page&pageSize&status`
- `GET /api/mobile/v1/alarms/:alarmId`
- `GET /api/mobile/v1/tasks?scope=my|visible&page&pageSize`

Alarm and task payloads include backend-derived action flags:

- `canAcknowledge`
- `canSelfAssign`
- `canAssign`
- `canAcceptAssignment`
- `canVerify`

### Workflow mutations

- `POST /api/mobile/v1/alarms/:alarmId/self-assign`
- `GET /api/mobile/v1/alarms/:alarmId/assignee-options`
- `POST /api/mobile/v1/alarms/:alarmId/assignments`
- `POST /api/mobile/v1/assignments/:assignmentId/accept`
- `POST /api/mobile/v1/alarms/:alarmId/acknowledgements`
- `POST /api/mobile/v1/alarms/:alarmId/verifications`

Supervisor-only endpoints:

- `GET /alarms/:alarmId/assignee-options`
- `POST /alarms/:alarmId/assignments`
- `GET /tasks?scope=visible`

### Notifications

- `GET /api/mobile/v1/notifications`
- `POST /api/mobile/v1/notifications/:id/read`
- `POST /api/mobile/v1/notifications/read-all`

This covers in-app notification data only. Native mobile push registration and delivery are intentionally out of scope for v1.

## Request examples

### Login

```http
POST /api/mobile/v1/auth/login
Content-Type: application/json

{
  "email": "responder@example.com",
  "password": "secret",
  "installId": "android-device-install-id",
  "deviceName": "Pixel 8",
  "platform": "android",
  "appVersion": "1.0.0"
}
```

### Refresh

```http
POST /api/mobile/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}
```

### Acknowledgement with evidence

`POST /api/mobile/v1/alarms/:alarmId/acknowledgements`

Use `multipart/form-data`:

- `remarks`
- `evidence` repeated for each file

### Verification with evidence

`POST /api/mobile/v1/alarms/:alarmId/verifications`

Use `multipart/form-data`:

- `latitude`
- `longitude`
- `remarks`
- `evidence` repeated for each file
