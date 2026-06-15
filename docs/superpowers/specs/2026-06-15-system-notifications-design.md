# System Notifications (Toggle + Push Client) — Design Spec

**Date:** 2026-06-15
**Branch:** `frontend/uifixes` (from `origin/main`)
**Scope:** App-level "system notifications" toggle in Settings, OS permission, and a full
push client (Expo push token → backend registration). **Frontend only** — remote delivery
needs the documented backend work.

## Problem

The app has only **in-app** notifications (DB records shown in a panel). There is no OS-level
("system") notification: nothing pops up. `expo-notifications` was not installed, and the
backend has no push infrastructure (no token storage, no endpoint, no send library).

## Decisions (agreed)

1. **Full push client now + documented backend steps.** Remote push activates once the
   backend is built; the client is ready and degrades gracefully until then.
2. **Global toggle only.** The per-task `params.notifications` flag is left untouched and has
   no effect for now (no task-reminder trigger / deadline field exists).

## Architecture (isolated units)

### Pure (unit-tested, no native imports)
- **`notifications/notificationPreference.ts`**: `NOTIF_STORAGE_KEY`,
  `parseStoredPreference(raw)` (defaults to off), `serializePreference(enabled)`.

### Native wrapper (not unit-tested — delegates to the SDK)
- **`notifications/systemNotifications.ts`** wraps `expo-notifications`:
  `setNotificationHandler` (foreground banner, set once on import), `getPermissionStatus`,
  `requestPermission`, `ensureAndroidChannel`, `getExpoPushToken` (returns `null` when no EAS
  `projectId` / Expo Go / no device — graceful), `presentTestNotification` (immediate local).

### Service layer (Result<T>, mock/HTTP parity)
- **`IPushService`**: `registerPushToken(userId, token)`, `unregisterPushToken(userId, token)`.
  - HTTP → `POST` / `DELETE /users/{id}/push-token` with `{ token }`.
  - Mock → stores tokens per user in a `Set` (idempotent register, no-op unregister).
  - Registered in `ServiceContainer` (`pushService`) and re-exported from `services`.

### State + UI
- **`hooks/useSystemNotifications.ts`**: persists the toggle (AsyncStorage, mirroring
  `LocaleContext`); on load, reconciles with the live OS permission (revoked → off). `toggle()`:
  - **on**: `requestPermission()`; if granted → `ensureAndroidChannel()`, `getExpoPushToken()`,
    `registerPushToken` (when a token exists), persist; if denied → toast, stay off.
  - **off**: best-effort `unregisterPushToken`, persist.
- **`SettingsRow`** gains an optional `rightAccessory` slot (replaces the chevron).
- **`SettingsScreen`** gains a "Notifications" section: a `Switch` row bound to the toggle, and
  (when enabled) a "Send a test notification" row → `presentTestNotification`.
- **i18n**: `settings.sections.notifications`, `settings.notifications.*` (EN + PL, type-enforced parity).

## Testing (TDD)

- `notificationPreference` — parse/serialise round-trip and safe default.
- `MockPushService` — register (idempotent), unregister, inspection helper.
- Native wrapper, hook, and UI are not unit-tested (native/React; no renderer in the `node`
  env) — consistent with the rest of the suite.

## Dependency

- **New:** `expo-notifications` (`npx expo install expo-notifications`, SDK 54-compatible,
  resolved 0.32.x). `expo-constants` is intentionally NOT added; the EAS `projectId` is read
  by the SDK from app config in a build, and the token getter degrades to `null` otherwise.

## Constraints (testing reality)

- Remote push does **not** work in Expo Go (SDK 53+); a **development/EAS build** is required.
- Acquiring an Expo push token needs a **physical device** (not the iOS simulator).
- The local **test notification** works on a dev build and is the tangible proof without a backend.

## Backend steps (to be done separately — NOT modified here)

1. **Token storage**: a `device_tokens` table (`user_id`, `token`, `platform`, `created_at`)
   to support multiple devices per user.
2. **Endpoints**: `POST /users/{user_id}/push-token` (upsert `{ token }`) and
   `DELETE /users/{user_id}/push-token` (remove `{ token }`).
3. **Send library**: add `exponent-server-sdk` to `requirements.txt`; a small client to send
   Expo push messages (with receipt handling).
4. **Send on event**: at each point that creates a `Notification` record (e.g. `User.notify()`
   / friend invitations, `POST /users/{id}/notifications`), after persisting, look up the
   user's tokens and send an Expo push with the message.
5. **Config**: set the EAS `projectId` in app config and produce a dev/EAS build so
   `getExpoPushTokenAsync` returns a token.

## Out of scope

- Task-deadline reminders / wiring `params.notifications` (no deadline field, no trigger).
- Any backend code changes.
