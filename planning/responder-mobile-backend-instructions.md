# Responder Mobile Backend Instructions

## Purpose

Use this file when building the dedicated responder mobile app for GPS tracking.

The mobile app must talk only to the backend APIs that own:

- responder authentication
- patrol session start/stop
- GPS batch upload
- current patrol session recovery

Do not build the app against dashboard pages, map pages, or operator-only APIs.

## Current Backend Ownership

- Auth is owned by:
  - `integrations/auth/*`
  - `modules/identity-access/*`
- GPS tracking is owned by:
  - `modules/patrol/*`
- Current HTTP routes are:
  - `POST /api/rmp-tracking/sessions`
  - `GET /api/rmp-tracking/sessions/current`
  - `PATCH /api/rmp-tracking/sessions/:id/stop`
  - `POST /api/rmp-tracking/pings`

Relevant backend files:

- [sessions route](/Users/barbatos/Desktop/pids-alarm-management-system/app/api/rmp-tracking/sessions/route.ts)
- [current session route](/Users/barbatos/Desktop/pids-alarm-management-system/app/api/rmp-tracking/sessions/current/route.ts)
- [stop session route](/Users/barbatos/Desktop/pids-alarm-management-system/app/api/rmp-tracking/sessions/[id]/stop/route.ts)
- [pings route](/Users/barbatos/Desktop/pids-alarm-management-system/app/api/rmp-tracking/pings/route.ts)
- [tracking schema](/Users/barbatos/Desktop/pids-alarm-management-system/modules/patrol/patrol.schema.ts)
- [tracking commands](/Users/barbatos/Desktop/pids-alarm-management-system/modules/patrol/application/commands.ts)
- [auth options](/Users/barbatos/Desktop/pids-alarm-management-system/integrations/auth/options.ts)
- [roles](/Users/barbatos/Desktop/pids-alarm-management-system/constants/access/roles.ts)

## Do Not Use These APIs From Mobile

The mobile app must not call these backend surfaces:

- any `/(dashboard)` page route
- operator map routes
- operator RMP tracking routes
- notification bell routes unless explicitly added to the mobile scope later
- internal scheduler routes
- report routes
- direct NextAuth internals as the long-term mobile auth contract

Specifically avoid building the mobile app against:

- `/api/operator/rmp-tracking/latest`
- `/api/operator/rmp-tracking/map`
- `/operator/*`
- `/supervisor/*`
- `/rmp/*`

## Current GPS API Contract

### 1. Start Patrol Session

- `POST /api/rmp-tracking/sessions`

Success:

```json
{
  "sessionId": "uuid",
  "startedAt": "2026-04-11T03:30:00.000Z",
  "intervalSeconds": 60,
  "lastRecordedAt": null
}
```

Important rules:

- only one active session per user
- user must already have mapped chainages with `READY` geometry
- current route allows only role `RMP`

Typical failures:

- `401 Unauthorized`
- `403 Forbidden`
- `409 You already have an active patrol session.`
- `409 No chainage mappings found for this patrol account.`
- `409 No READY chainage geometry is available...`
- `503` when patrol tracking schema is unavailable

### 2. Get Current Patrol Session

- `GET /api/rmp-tracking/sessions/current`

Success:

```json
{
  "session": {
    "sessionId": "uuid",
    "startedAt": "2026-04-11T03:30:00.000Z",
    "intervalSeconds": 60,
    "lastRecordedAt": "2026-04-11T03:35:00.000Z"
  }
}
```

or:

```json
{
  "session": null
}
```

Use this on app startup and after reconnect to reconcile local tracking state.

### 3. Stop Patrol Session

- `PATCH /api/rmp-tracking/sessions/:id/stop`

Success:

```json
{
  "sessionId": "uuid",
  "startedAt": "2026-04-11T03:30:00.000Z",
  "intervalSeconds": 60,
  "lastRecordedAt": "2026-04-11T03:40:00.000Z"
}
```

Important rules:

- the session must belong to the authenticated user
- stopping an already stopped session is effectively idempotent

### 4. Upload GPS Points

- `POST /api/rmp-tracking/pings`

Request body:

```json
{
  "sessionId": "uuid",
  "points": [
    {
      "clientPointId": "device-session-000001",
      "recordedAt": "2026-04-11T03:35:00.000Z",
      "latitude": 19.076,
      "longitude": 72.8777,
      "accuracyMeters": 8.2,
      "source": "INTERVAL"
    }
  ]
}
```

Success:

```json
{
  "success": true,
  "acceptedCount": 1,
  "lastRecordedAt": "2026-04-11T03:35:00.000Z"
}
```

Validation rules:

- `sessionId` must be a UUID
- `points` length must be `1..250`
- `recordedAt` must be an ISO datetime string with offset
- `latitude` must be `-90..90`
- `longitude` must be `-180..180`
- `accuracyMeters` must be `>= 0` when present
- `source` must be one of:
  - `START`
  - `INTERVAL`
  - `VISIBILITY_RESUME`

Important behavior:

- duplicate `clientPointId` values are deduplicated server-side
- the current server future-skew allowance is `120` seconds
- if all points are already known, the API returns `acceptedCount: 0`

## Mobile Sync Rules

The mobile app should follow these rules:

1. Persist all captured GPS points locally first.
2. Use a stable `clientPointId` per point so retries stay idempotent.
3. Sync points in session order.
4. Upload in batches of at most `250`.
5. On app launch, call `GET /api/rmp-tracking/sessions/current`.
6. If the backend has an active session and local state does not, reattach to that backend session.
7. If the backend has no active session, do not upload points.
8. When the user explicitly starts tracking, call session start first, then begin collecting points.
9. When the user explicitly stops tracking, flush queued points first when possible, then stop the session.

## Authentication Guidance

### Current State

The current backend auth is browser-oriented NextAuth credentials with JWT session cookies.

Current route:

- `/api/auth/[...nextauth]`

This is acceptable for the web app, but it is not the preferred contract for a dedicated React Native app.

### Recommended Mobile Contract

Add dedicated mobile auth endpoints in this backend and make the mobile app use those only:

- `POST /api/mobile/auth/login`
- `POST /api/mobile/auth/logout`
- `GET /api/mobile/auth/me`
- optionally `POST /api/mobile/auth/refresh`

Recommended behavior:

- login with email + password
- return a mobile-friendly access token contract
- use bearer auth for mobile tracking routes
- do not make the React Native app depend on NextAuth CSRF/cookie internals

### Temporary Fallback

If you absolutely want zero auth changes for an early spike, the mobile app could try to use the existing NextAuth credentials flow and persist cookies. This is not recommended for the actual responder tracking app.

## Recommended Mobile Route Namespace

For the dedicated app, add route aliases so the mobile client depends on a stable mobile contract instead of web-oriented naming:

- `POST /api/mobile/tracking/sessions`
- `GET /api/mobile/tracking/sessions/current`
- `PATCH /api/mobile/tracking/sessions/:id/stop`
- `POST /api/mobile/tracking/pings`

These routes should reuse the same `modules/patrol` commands and schemas under the hood.

## Required Backend Changes In PIDS AMS

These changes are recommended before the mobile app is built seriously:

### Must Do

1. Add dedicated mobile auth endpoints.
2. Add mobile tracking route aliases or a mobile namespace.
3. Decide whether the app is for only `RMP` or for all responder roles.
4. If it is for all responders, expand the current tracking route guard beyond `RMP`.
5. Keep the mobile app on tracking/auth APIs only.

### Strongly Recommended

1. Return a small `me` payload from mobile auth with:
   - `id`
   - `name`
   - `email`
   - `role`
2. Keep one active tracking session per user.
3. Keep `clientPointId` idempotency exactly as it is.
4. Keep upload batch validation on the backend.

### Optional Later

1. Add device metadata capture:
   - app version
   - platform
   - device ID
2. Add battery/network hints for diagnostics.
3. Add an explicit sync status endpoint if the app later needs richer reconciliation.

## Role Decision Needed

The current tracking routes explicitly allow only `RMP`.

But the responder role family in this backend is:

- `RMP`
- `QRV`
- `NPV`
- `ER`

If the dedicated app is for all responder roles, the backend must change its tracking auth guard accordingly.

## Interval Decision Needed

The backend currently supports tracking intervals of:

- `60`
- `300`

Current default is environment-driven and often resolves to `300` seconds.

Your mobile product requirement says `1 minute interval`, so confirm that the backend environment should use `60`.

Relevant config:

- [patrol config](/Users/barbatos/Desktop/pids-alarm-management-system/modules/patrol/core/config.ts)

## Instruction To The Mobile App Team

Build the responder mobile app as if the backend contract is:

- mobile auth
- session start
- current session recovery
- session stop
- bulk ping upload

Do not couple the app to:

- dashboard screens
- operator APIs
- PDF/report APIs
- map UI APIs
- direct database assumptions
- NextAuth browser implementation details

## Bottom Line

### What already exists and can be reused now

- patrol session start/stop logic
- current session lookup
- bulk GPS upload
- point deduplication
- derived geofence metrics
- responder/user identity data

### What should change in this backend before the dedicated app starts

- add dedicated mobile auth
- add mobile-namespaced tracking routes
- widen role access if the app is not `RMP`-only

Without those changes, the mobile app can technically prototype against the current backend, but it will be coupled to web-oriented auth and `RMP`-only route rules.
