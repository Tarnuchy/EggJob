# Push Notifications — Frontend Completion Design

- **Date:** 2026-06-16
- **Status:** Approved (design); pending spec review → implementation plan
- **Branch:** `frontend/push-notifications` (off `origin/main`)
- **Predecessor spec:** `docs/superpowers/specs/2026-06-15-system-notifications-design.md` (the original push-client design)

## 1. Context

The full push **client** (preference persistence, native wrapper with token/permission
guards, the toggle hook, `IPushService` mock+HTTP, Settings UI + i18n) already shipped on
`frontend/uifixes` (commit `7492a7c`) and is present on this branch.

The **backend** push infrastructure is now merged on `main` (commit `f5e219c`):

- `device_tokens` table + migration `a7b8c9d0e1f2_create_device_tokens.py`
  (`userID`, `token` unique, `platform`, `createdAt`).
- `POST /users/{user_id}/push-token` → **201**, body `{ token, platform? }`, upsert.
- `DELETE /users/{user_id}/push-token` → **200**, body `{ token }`, remove.
- Both require auth; `assert_self(user_id, current_user)` enforces `{user_id}` == authenticated user.
- `exponent-server-sdk` send in a fire-and-forget background thread after commit, wired into
  `Notification` creation (`User.notify()`, invitations, `POST /users/{id}/notifications`),
  with dead-token pruning on `DeviceNotRegisteredError`.
- Push payload is `PushMessage(to, title, body)` — **no structured `data` field.**

This branch was created off `origin/main`, so the backend code is in-tree for contract
verification and (eventually) end-to-end testing.

**Verified — work item #1 (endpoint contract) needs no change.** `HttpPushService` already
POSTs/DELETEs `/users/{userId}/push-token` with body `{ token }`, sends `buildAuthHeaders()`,
and treats `response.ok` as success (covers 201 *and* 200). A 403 from `assert_self` maps to
`http-403` — acceptable as-is.

## 2. Goal & scope

Complete the **frontend** push lifecycle and receive-handling on top of the existing client:

1. Unify token registration across **toggle**, **startup/login**, **token rotation**, and
   **logout** behind a single source of truth and a single backend-call path.
2. Add the three native receive listeners and wire app reactions (foreground refresh, tap → panel).
3. Scaffold EAS config so a development build can obtain a real Expo push token.

Chosen architecture: **Approach A — `SystemNotificationsProvider`** (lift the toggle hook's
internals into a context provider that also runs the reconcile lifecycle), with a pure,
node-tested planner (`planPushCommands`) as its core.

## 3. Architecture overview

| Unit | Purpose | Depends on | Node-tested |
|---|---|---|---|
| `notifications/pushRegistration.ts` **(new, pure)** | Diff desired vs. registered → command list | nothing | ✅ |
| `notifications/systemNotifications.ts` **(extend)** | Native wrappers for the 3 listeners | expo-notifications, RN | ❌ native |
| `application/SystemNotificationsProvider.tsx` **(new)** | Owns `enabled`/`busy`/`toggle()`; runs reconcile; owns rotation listener | pushRegistration, systemNotifications, notificationPreference, `pushService`, session userId | ❌ shell |
| `hooks/usePushNotificationReactions.ts` **(new)** | Foreground receive → `refresh()`; tap → `setOpenPanel('notifications')` | systemNotifications wrappers, NotificationsContext, PanelContext | ❌ shell |
| `screens/profile/SettingsScreen.tsx` **(edit)** | Consume provider via context | provider | — |
| `navigation/PanelHost.tsx` **(edit)** | Mount provider + reactions bridge | provider, hook | — |
| `app.json` **(edit)** + `eas.json` **(optional new)** | `expo-notifications` plugin + `extra.eas.projectId` | — | — |

The existing pure modules (`notificationPreference.ts`) and the native wrapper's existing
exports (`getExpoPushToken`, `requestPermission`, `getPermissionStatus`, `ensureAndroidChannel`,
`presentTestNotification`, `setNotificationHandler`) are reused unchanged.

## 4. Pure core — `planPushCommands`

```ts
// notifications/pushRegistration.ts — PURE, no expo/RN imports
export interface DesiredPushState {
  userId: string | null;       // real session user (null = logged out)
  enabled: boolean;            // persisted toggle preference
  permissionGranted: boolean;  // OS permission === 'granted'
  token: string | null;        // Expo push token, or null if unavailable
}
export interface PushRegistration { userId: string; token: string; }
export type PushCommand =
  | { type: 'register'; userId: string; token: string }
  | { type: 'unregister'; userId: string; token: string };

export function planPushCommands(
  desired: DesiredPushState,
  registered: PushRegistration | null,
): PushCommand[];
```

Semantics:

- `wantOn = enabled && permissionGranted && userId !== null`
- `target = (wantOn && token !== null) ? { userId, token } : null`
- If `registered` equals `target` (same `userId`+`token`, or both `null`) → `[]`.
- **Churn guard:** if `wantOn && token === null && registered?.userId === userId` → `[]`
  (token only transiently missing for the same user we still want on; do not tear down).
- Otherwise: if `registered` exists → emit `unregister(registered)`; then if `target` exists
  → emit `register(target)`.

| Scenario | registered | desired | commands |
|---|---|---|---|
| Off, none registered | `null` | enabled=false | `[]` |
| Turn on (token present) | `null` | on, U, T | `[register(U,T)]` |
| No change | `{U,T}` | on, U, T | `[]` |
| Token rotated | `{U,T}` | on, U, **T2** | `[unregister(U,T), register(U,T2)]` |
| User switched | `{U1,T}` | on, **U2**, T | `[unregister(U1,T), register(U2,T)]` |
| Logout | `{U,T}` | userId=null | `[unregister(U,T)]` |
| Toggle off | `{U,T}` | enabled=false | `[unregister(U,T)]` |
| Permission revoked | `{U,T}` | granted=false | `[unregister(U,T)]` |
| Churn guard: token transiently null, same user | `{U,T}` | on, U, token=null | `[]` |
| User switched, no token yet | `{U1,T}` | on, U2, token=null | `[unregister(U1,T)]` |

## 5. `SystemNotificationsProvider`

Public context surface (identical to today's hook so `SettingsScreen` barely changes):

```ts
interface SystemNotificationsContextValue {
  enabled: boolean;
  busy: boolean;
  toggle: () => Promise<void>;
}
```

- **Owns:** `enabled` (persisted via `notificationPreference`), `busy`, and refs
  `registeredRef: PushRegistration | null` (last value told to the backend) and `tokenRef`.
- **Desired state** is built from `selectCurrentUserId(state)` (nullable — via `useAppState()`,
  *not* `useCurrentUserId()` which substitutes the dev fallback), `enabled`, `permissionGranted`,
  and the current `token`.
- **Reconcile effect** (deps: userId, enabled, permissionGranted, token):
  `planPushCommands(desired, registeredRef.current)` → run each command via
  `pushService.register/unregisterPushToken`, updating `registeredRef` from each `Result`
  (`register` ok → `{U,T}`; `unregister` ok → `null`). Best-effort: failures are swallowed,
  mirroring the backend's fire-and-forget delivery.
- **`toggle()`:**
  - *enable:* `requestPermission()` → if not `granted`, show `permissionDenied` toast and bail;
    `ensureAndroidChannel()`; `getExpoPushToken()` → set token; persist `true`; `setEnabled(true)`.
  - *disable:* persist `false`; `setEnabled(false)`. **No token fetch** — reconcile unregisters
    from `registeredRef`.
  - `busy` guards re-entrancy (unchanged from today).
- **Mount-time reconcile:** load persisted preference; if stored and permission `granted`,
  set `enabled(true)` and fetch token (reconcile registers); if permission was revoked while
  stored-enabled, flip to `false` and persist (UI honesty), reconcile unregisters.
- **Token rotation:** `addPushTokenChangeListener(() => refetchToken())`, where `refetchToken`
  calls `getExpoPushToken()` and `setToken(result)`. The native `addPushTokenListener` yields the
  *device* (FCM/APNs) token, not the Expo token, so we ignore its payload and re-fetch the Expo
  token. Reconcile then emits `[unregister(old), register(new)]`. Subscription removed on unmount.

## 6. Logout ordering contract

When `selectCurrentUserId` → `null`, reconcile emits `unregister(registeredRef)`. The
`DELETE /push-token` requires auth headers, so it must run **before** the auth token is cleared.

No logout UI exists yet (`auth/logout` only clears `session` in the reducer; nothing calls
`authService.logout()`). This spec therefore records an **integration contract** for whoever
builds logout: dispatch `auth/logout` (clearing session userId) and allow the push unregister
to fire *before* `authService.logout()` clears the stored token. The provider's unmount cleanup
is a best-effort safety net. This is a documented limitation, not a present-day defect.

## 7. Native wrapper additions — `systemNotifications.ts`

Three thin wrappers returning the subscription for cleanup. The subscription type is aliased
from the SDK to avoid a direct `expo-modules-core` import:
`type NotificationSubscription = ReturnType<typeof Notifications.addNotificationReceivedListener>;`

```ts
// addPushTokenListener yields the *device* (FCM/APNs) token, not the Expo token the backend
// needs — so we ignore the payload, signal a change, and let the provider re-fetch getExpoPushToken().
export function addPushTokenChangeListener(onChange: () => void): NotificationSubscription;
export function addReceivedListener(cb: () => void): NotificationSubscription;   // foreground receive
export function addResponseListener(cb: () => void): NotificationSubscription;   // notification tap
```

`getExpoPushToken()` is unchanged — it relies on Expo auto-detecting `extra.eas.projectId` from
`app.json` once configured, and its existing guard returns `null` in Expo Go / without a
projectId / on a non-physical device.

## 8. Reactions hook + wiring

`usePushNotificationReactions()`: on mount subscribe
`addReceivedListener(() => void refresh())` (from `NotificationsContext`) and
`addResponseListener(() => setOpenPanel('notifications'))` (from `PanelContext`); remove both on
unmount.

`PanelHost` tree (provider outermost so `SettingsScreen` under `MainTabs` sees the context; a
tiny `PushReactionsBridge` sits under both `NotificationsProvider` and `PanelContext`):

```tsx
<PanelContext.Provider value={contextValue}>
  <SystemNotificationsProvider>
    <NotificationsProvider>
      <View style={styles.container}>
        <PushReactionsBridge />   {/* calls usePushNotificationReactions() */}
        <MainTabs />
        <SlideOverPanel panel={openPanel} onClose={handleClose} />
      </View>
    </NotificationsProvider>
  </SystemNotificationsProvider>
</PanelContext.Provider>
```

`SettingsScreen` swaps `useSystemNotifications()` for `useSystemNotificationsContext()`
— same `{ enabled, busy, toggle }`, no JSX changes. The standalone `useSystemNotifications`
hook is removed (its internals move into the provider) once `SettingsScreen` is migrated.

**Cold-start taps** (app launched from a killed state) require `getLastNotificationResponseAsync()`
and are deferred as a documented follow-up.

## 9. EAS config + end-to-end verification

`app.json`:
- Add `"expo-notifications"` to `plugins`.
- Add `extra.eas.projectId` with a clearly-marked placeholder; the user pastes the real id from
  expo.dev or runs `eas init`. Until then `getExpoPushToken()` returns `null` and the app stays
  functional (no remote token).

Optional `eas.json`: minimal `development` profile (`developmentClient: true`). `eas init` /
`eas build` require the user's Expo account login and are run by the user, not in this workspace.

E2E path (gated on a real projectId + dev build; Expo Go cannot receive remote push on SDK 54,
and iOS tokens need a physical device): real projectId → `eas build --profile development` →
install on a physical device → backend running with `alembic upgrade head`, `JWT_SECRET` /
`EXPO_ACCESS_TOKEN` set, reachable at `API_BASE_URL`, `EXPO_PUBLIC_USE_HTTP_SERVICES=true` →
log in → toggle on (grant permission; expect `POST … 201`) → trigger a server Notification
(friend invite or `POST /users/{id}/notifications`) → push arrives; foreground = panel/dot
refresh, tap = panel opens → toggle off (expect `DELETE … 200`).

## 10. Testing strategy

- **TDD the pure core only:** `tests/frontend/unit/notifications/push-registration.test.ts`
  covering all 10 decision-table rows + a both-`null` no-op + a rotate-then-switch sequence
  (~11–12 tests).
- Provider, hooks, and native wrappers import expo/RN and so are **not** node-tested, per the
  project convention (tested modules must not import `expo-*`). They are thin shells over the
  tested planner + the native SDK.
- **Gates:** `npm run typecheck` = 0 and `npm test` green after every change. New baseline ≈
  171 (current) + ~12 = ~183 tests. No `any`; `Result<T>` is already the `pushService` contract.

## 11. i18n

No new user-facing strings. The lifecycle and listeners are silent (tap opens the existing
panel; foreground relies on the OS banner). Existing `settings.notifications.*` keys are
untouched, so `en.ts` / `pl.ts` structural parity is unaffected. (A future foreground toast,
if added, would require matching EN+PL keys — out of scope.)

## 12. Scope & known limitations

**In scope:** `pushRegistration.ts` + tests · `SystemNotificationsProvider` (replaces the hook's
internals) · 3 native listener wrappers · `usePushNotificationReactions` + `PushReactionsBridge`
· `PanelHost` wiring · `SettingsScreen` context swap · `app.json` (+ optional `eas.json`) scaffold.

**Out of scope:** per-task `params.notifications` flag (no backend triggers) · any backend change
· cold-start tap routing · payload-based deep-linking (backend push has no `data`) · building the
logout UI.

**Known limitations:** best-effort registration with no retry/queue (mirrors the backend);
logout unregister depends on the documented ordering contract (§6); end-to-end push is blocked
until a real EAS projectId and a development build exist.

## 13. Files touched

- **New:** `src/frontend/notifications/pushRegistration.ts`,
  `src/frontend/application/SystemNotificationsProvider.tsx`,
  `src/frontend/hooks/usePushNotificationReactions.ts`,
  `tests/frontend/unit/notifications/push-registration.test.ts`,
  `eas.json` (optional).
- **Edited:** `src/frontend/notifications/systemNotifications.ts`,
  `src/frontend/navigation/PanelHost.tsx`,
  `src/frontend/screens/profile/SettingsScreen.tsx`,
  `app.json`.
- **Removed:** `src/frontend/hooks/useSystemNotifications.ts` (internals moved into the provider;
  removed after `SettingsScreen` is migrated).
