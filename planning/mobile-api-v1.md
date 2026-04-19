# Mobile API (v1)

Base path: `/api/mobile/v1`

All endpoints use **JSON** (`Content-Type: application/json` where a body is sent). Responses are JSON unless noted.

## Authentication

- **Bearer access token**: send `Authorization: Bearer <accessToken>` for routes that require an authenticated session.
- **Access tokens** are short-lived JWTs (about **15 minutes**).
- **Refresh tokens** are opaque strings returned by login and refresh; store them securely and use them only with `POST /auth/refresh`. Refresh tokens are tied to a server-side session (about **30 days** rolling expiry when used).

### Who can sign in

Only users whose role is in the **field assignee** set may use mobile auth: **SUPERVISOR**, **RMP**, **QRV**, **NPV**, **ER**. Other roles receive `403` with code `FORBIDDEN_ROLE`.

---

## Error responses

Failed requests return an object shaped like:

```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human-readable message.",
    "fieldErrors": {}
  }
}
```

`fieldErrors` is omitted when there are no per-field validation errors. For validation failures (`VALIDATION_ERROR`), keys match request fields (e.g. `email`, `password`, `installId`, `refreshToken`).

Common HTTP status codes: `400` (bad request / validation), `401` (not authenticated or invalid session), `403` (forbidden role), `404` (not found), `503` (auth not configured server-side).

---

## `POST /api/mobile/v1/auth/login`

Creates a mobile session and returns tokens.

**Body**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `email` | string | yes | Trimmed, lowercased by server |
| `password` | string | yes | |
| `installId` | string | yes | Stable app installation id (1–200 chars) |
| `deviceName` | string | no | Max 120 chars |
| `platform` | string | no | Max 50 chars (e.g. `ios`, `android`) |
| `appVersion` | string | no | Max 50 chars |

**200 response**

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<opaque>",
  "expiresAt": "<ISO-8601>",
  "user": {
    "id": "<uuid>",
    "name": "…",
    "email": "…",
    "role": "SUPERVISOR"
  }
}
```

**Typical error codes**: `INVALID_REQUEST`, `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `FORBIDDEN_ROLE`, `UNAUTHORIZED`, `AUTH_CONFIG_ERROR`.

---

## `POST /api/mobile/v1/auth/refresh`

Exchanges a valid refresh token for a **new** access token and **new** refresh token (rotation). The previous refresh token must not be reused after a successful refresh.

**Body**

| Field | Type | Required |
| --- | --- | --- |
| `refreshToken` | string | yes (1–500 chars) |

**200 response**

Same shape as login (`accessToken`, `refreshToken`, `expiresAt`, `user`).

**Typical error codes**: `INVALID_REQUEST`, `VALIDATION_ERROR`, `UNAUTHORIZED` (invalid/expired/revoked session), `INACTIVE_USER`, `FORBIDDEN_ROLE`, `AUTH_CONFIG_ERROR`.

---

## `POST /api/mobile/v1/auth/logout`

Revokes the current mobile session. Requires a valid **access** token.

**Headers**: `Authorization: Bearer <accessToken>`

**Body**: none.

**200 response**

```json
{ "success": true }
```

**Typical error codes**: `UNAUTHORIZED`, `INACTIVE_USER`, `FORBIDDEN_ROLE`, `AUTH_CONFIG_ERROR`.

---

## `GET /api/mobile/v1/profile`

Returns the signed-in user’s profile.

**Headers**: `Authorization: Bearer <accessToken>`

**200 response**

```json
{
  "user": {
    "id": "<uuid>",
    "name": "…",
    "email": "…",
    "role": "RMP",
    "phone": "+… or null",
    "isActive": true
  }
}
```

**Typical error codes**: `UNAUTHORIZED`, `INACTIVE_USER`, `FORBIDDEN_ROLE`, `NOT_FOUND` (profile missing), `AUTH_CONFIG_ERROR`.

---

## Client checklist

1. On login, persist `refreshToken` and `expiresAt`; use `accessToken` for API calls until expiry.
2. Before expiry (or on `401`), call refresh with the stored refresh token; replace stored tokens with the response.
3. Send `Authorization: Bearer <accessToken>` for logout and profile.
4. On logout, clear local tokens; treat refresh failures as signed-out.
