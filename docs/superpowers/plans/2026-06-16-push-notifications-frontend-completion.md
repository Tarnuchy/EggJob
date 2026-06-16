# Push Notifications — Frontend Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the frontend push-notification lifecycle (register on login/startup, re-register on token rotation and user switch, unregister on logout) and incoming-push reactions (foreground refresh, tap → notifications panel), on top of the already-shipped push client.

**Architecture:** A pure, node-tested planner (`planPushCommands`) computes the minimal register/unregister command list from desired state vs. the last-registered token. A `SystemNotificationsProvider` (replacing the internals of `useSystemNotifications`) owns the `enabled`/permission/token state, runs the reconcile loop through that planner, and owns the token-rotation listener. A small reactions hook wires incoming pushes to `NotificationsContext.refresh()` and taps to `setOpenPanel('notifications')`. Both are mounted in the authenticated shell, `PanelHost`.

**Tech Stack:** React Native 0.81 / Expo SDK 54 (`expo-notifications` ~0.32.17), React 19, TypeScript strict, Vitest (node env). Spec: `docs/superpowers/specs/2026-06-16-push-notifications-frontend-completion-design.md`.

> **Commits:** This project's rule is **no commits without an explicit user request**. The `Commit` steps below are checkpoints — when executing, stage the changes and pause for the user's go-ahead rather than committing unprompted. After every task, the quality gate is `npm run typecheck` (0 errors) and `npm test` (green).

> **Baseline:** branch `frontend/push-notifications` (off `origin/main`). At start: typecheck 0, **171** tests passing. After Task 1: **~183** tests. Tasks 2–6 add no unit tests (native shells / config), so the count holds at ~183.

---

## File Structure

**New files**
- `src/frontend/notifications/pushRegistration.ts` — pure planner: `DesiredPushState`, `PushRegistration`, `PushCommand`, `planPushCommands`. No expo/RN imports.
- `tests/frontend/unit/notifications/push-registration.test.ts` — Vitest coverage of the planner.
- `src/frontend/application/SystemNotificationsProvider.tsx` — context provider; owns enablement + reconcile lifecycle + rotation listener; exposes `{enabled, busy, toggle}`.
- `src/frontend/hooks/usePushNotificationReactions.ts` — subscribes received/response listeners; refresh + open panel.
- `eas.json` — minimal EAS build profiles (optional; for dev builds).

**Modified files**
- `src/frontend/notifications/systemNotifications.ts` — add 3 native listener wrappers.
- `src/frontend/navigation/PanelHost.tsx` — mount provider + `PushReactionsBridge`.
- `src/frontend/screens/profile/SettingsScreen.tsx` — consume provider context instead of the hook.
- `app.json` — add `expo-notifications` plugin + `extra.eas.projectId`.

**Removed files**
- `src/frontend/hooks/useSystemNotifications.ts` — internals move into the provider; deleted once `SettingsScreen` is migrated (Task 5).

---

## Task 1: Pure planner `planPushCommands` (TDD)

**Files:**
- Create: `src/frontend/notifications/pushRegistration.ts`
- Test: `tests/frontend/unit/notifications/push-registration.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/frontend/unit/notifications/push-registration.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  planPushCommands,
  type DesiredPushState,
  type PushRegistration,
} from '../../../../src/frontend/notifications/pushRegistration';

const on = (over: Partial<DesiredPushState> = {}): DesiredPushState => ({
  userId: 'u1',
  enabled: true,
  permissionGranted: true,
  token: 't1',
  ...over,
});

const reg = (userId: string, token: string): PushRegistration => ({ userId, token });

describe('planPushCommands', () => {
  it('does nothing when off and nothing is registered', () => {
    expect(planPushCommands(on({ enabled: false }), null)).toEqual([]);
  });

  it('registers when turning on with a token and nothing registered', () => {
    expect(planPushCommands(on(), null)).toEqual([
      { type: 'register', userId: 'u1', token: 't1' },
    ]);
  });

  it('does nothing when the desired registration already matches', () => {
    expect(planPushCommands(on(), reg('u1', 't1'))).toEqual([]);
  });

  it('re-registers (unregister old, register new) when the token rotates', () => {
    expect(planPushCommands(on({ token: 't2' }), reg('u1', 't1'))).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
      { type: 'register', userId: 'u1', token: 't2' },
    ]);
  });

  it('re-registers under the new user when the user switches', () => {
    expect(planPushCommands(on({ userId: 'u2' }), reg('u1', 't1'))).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
      { type: 'register', userId: 'u2', token: 't1' },
    ]);
  });

  it('unregisters on logout (userId becomes null)', () => {
    expect(planPushCommands(on({ userId: null }), reg('u1', 't1'))).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
    ]);
  });

  it('unregisters when the toggle is turned off', () => {
    expect(planPushCommands(on({ enabled: false }), reg('u1', 't1'))).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
    ]);
  });

  it('unregisters when OS permission is revoked', () => {
    expect(planPushCommands(on({ permissionGranted: false }), reg('u1', 't1'))).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
    ]);
  });

  it('churn guard: keeps registration when token is transiently null for the same user', () => {
    expect(planPushCommands(on({ token: null }), reg('u1', 't1'))).toEqual([]);
  });

  it('unregisters the stale user even when the new user has no token yet', () => {
    expect(planPushCommands(on({ userId: 'u2', token: null }), reg('u1', 't1'))).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
    ]);
  });

  it('does nothing when nothing is desired and nothing is registered (both null target)', () => {
    expect(planPushCommands(on({ token: null }), null)).toEqual([]);
  });

  it('converges across a rotate-then-switch sequence', () => {
    // start: register
    let registered: PushRegistration | null = null;
    const c1 = planPushCommands(on(), registered);
    expect(c1).toEqual([{ type: 'register', userId: 'u1', token: 't1' }]);
    registered = reg('u1', 't1');

    // token rotates
    const c2 = planPushCommands(on({ token: 't2' }), registered);
    expect(c2).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
      { type: 'register', userId: 'u1', token: 't2' },
    ]);
    registered = reg('u1', 't2');

    // user switches
    const c3 = planPushCommands(on({ userId: 'u2', token: 't2' }), registered);
    expect(c3).toEqual([
      { type: 'unregister', userId: 'u1', token: 't2' },
      { type: 'register', userId: 'u2', token: 't2' },
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- push-registration`
Expected: FAIL — cannot resolve `../../../../src/frontend/notifications/pushRegistration` (module does not exist yet).

- [ ] **Step 3: Write the minimal implementation**

Create `src/frontend/notifications/pushRegistration.ts`:

```ts
/**
 * Pure planner for backend push-token registration. Given the desired push state and the
 * last value registered with the backend, it returns the minimal list of register/unregister
 * commands. No expo/React imports — node-testable, the single source of truth for "should we
 * (un)register?" decisions. The imperative shell (SystemNotificationsProvider) executes the
 * returned commands and tracks the registered value.
 */
export interface DesiredPushState {
  /** The real session user, or null when logged out. */
  userId: string | null;
  /** Persisted toggle preference. */
  enabled: boolean;
  /** OS notification permission === 'granted'. */
  permissionGranted: boolean;
  /** Expo push token, or null when it cannot be obtained. */
  token: string | null;
}

export interface PushRegistration {
  userId: string;
  token: string;
}

export type PushCommand =
  | { type: 'register'; userId: string; token: string }
  | { type: 'unregister'; userId: string; token: string };

function sameRegistration(a: PushRegistration | null, b: PushRegistration | null): boolean {
  if (a === null || b === null) return a === b;
  return a.userId === b.userId && a.token === b.token;
}

export function planPushCommands(
  desired: DesiredPushState,
  registered: PushRegistration | null,
): PushCommand[] {
  const wantOn = desired.enabled && desired.permissionGranted && desired.userId !== null;
  const target: PushRegistration | null =
    wantOn && desired.userId !== null && desired.token !== null
      ? { userId: desired.userId, token: desired.token }
      : null;

  if (sameRegistration(registered, target)) {
    return [];
  }

  // Churn guard: we still want it on for the *same* user, but the token is only transiently
  // missing — keep the existing registration rather than tearing it down and rebuilding.
  if (
    registered !== null &&
    wantOn &&
    desired.token === null &&
    registered.userId === desired.userId
  ) {
    return [];
  }

  const commands: PushCommand[] = [];
  if (registered !== null) {
    commands.push({ type: 'unregister', userId: registered.userId, token: registered.token });
  }
  if (target !== null) {
    commands.push({ type: 'register', userId: target.userId, token: target.token });
  }
  return commands;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- push-registration`
Expected: PASS — 12 tests.

- [ ] **Step 5: Run the full quality gate**

Run: `npm run typecheck` → Expected: 0 errors.
Run: `npm test` → Expected: green, ~183 tests (171 + 12).

- [ ] **Step 6: Commit (checkpoint — only if user authorized commits)**

```bash
git add src/frontend/notifications/pushRegistration.ts tests/frontend/unit/notifications/push-registration.test.ts
git commit -m "feat(push): add pure planPushCommands registration planner with tests"
```

---

## Task 2: Native listener wrappers

**Files:**
- Modify: `src/frontend/notifications/systemNotifications.ts` (append after line 65)

No unit test — this file imports `expo-notifications`, so per the repo convention it is verified by typecheck only.

- [ ] **Step 1: Add the wrappers**

Append to the end of `src/frontend/notifications/systemNotifications.ts`:

```ts
/**
 * Subscription handle returned by the SDK's listener registration functions. Aliased via
 * `ReturnType` so this module needs no direct `expo-modules-core` import.
 */
type NotificationSubscription = ReturnType<typeof Notifications.addNotificationReceivedListener>;

/**
 * Fires when the device push token rotates. The SDK callback receives the *device* (FCM/APNs)
 * token, not the Expo token the backend needs — so we ignore the payload and just signal a
 * change; the caller re-fetches `getExpoPushToken()`.
 */
export function addPushTokenChangeListener(onChange: () => void): NotificationSubscription {
  return Notifications.addPushTokenListener(() => onChange());
}

/** Fires when a notification is received while the app is foregrounded. */
export function addReceivedListener(onReceived: () => void): NotificationSubscription {
  return Notifications.addNotificationReceivedListener(() => onReceived());
}

/** Fires when the user taps a notification (app foregrounded or returning from background). */
export function addResponseListener(onResponse: () => void): NotificationSubscription {
  return Notifications.addNotificationResponseReceivedListener(() => onResponse());
}
```

- [ ] **Step 2: Run the quality gate**

Run: `npm run typecheck` → Expected: 0 errors.
Run: `npm test` → Expected: green, ~183 tests (unchanged).

- [ ] **Step 3: Commit (checkpoint — only if user authorized commits)**

```bash
git add src/frontend/notifications/systemNotifications.ts
git commit -m "feat(push): add received/response/token-change native listener wrappers"
```

---

## Task 3: `SystemNotificationsProvider`

**Files:**
- Create: `src/frontend/application/SystemNotificationsProvider.tsx`

No unit test — React/expo shell, verified by typecheck. After this task the provider exists but is not yet consumed (the old `useSystemNotifications` hook still drives `SettingsScreen`); typecheck still passes because unused *exports* are allowed.

- [ ] **Step 1: Create the provider**

Create `src/frontend/application/SystemNotificationsProvider.tsx`:

```tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { pushService } from '../services';
import { useToast } from '../context/ToastContext';
import { useAppState } from './AppStateContext';
import { selectCurrentUserId } from './selectors';
import {
  NOTIF_STORAGE_KEY,
  parseStoredPreference,
  serializePreference,
} from '../notifications/notificationPreference';
import {
  addPushTokenChangeListener,
  ensureAndroidChannel,
  getExpoPushToken,
  getPermissionStatus,
  requestPermission,
} from '../notifications/systemNotifications';
import { planPushCommands, type PushRegistration } from '../notifications/pushRegistration';

interface SystemNotificationsContextValue {
  enabled: boolean;
  busy: boolean;
  toggle: () => Promise<void>;
}

const SystemNotificationsContext = createContext<SystemNotificationsContextValue | null>(null);

async function persist(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIF_STORAGE_KEY, serializePreference(enabled));
  } catch {
    // a persistence failure must not block the in-session toggle
  }
}

/**
 * App-level system-notifications source of truth. Owns the persisted toggle preference, OS
 * permission, and the current Expo push token; reconciles backend registration through the
 * pure planPushCommands planner whenever any of those change (covering startup/login, toggle,
 * token rotation, user switch, and logout). Mounted in the authenticated shell (PanelHost).
 */
export const SystemNotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAppState();
  const userId = selectCurrentUserId(state);
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const registeredRef = useRef<PushRegistration | null>(null);

  // Reconcile backend registration whenever the desired state changes. Best-effort: failures
  // are swallowed, mirroring the backend's fire-and-forget delivery. Overlapping runs are
  // harmless — register/unregister are idempotent (backend upsert, mock Set).
  useEffect(() => {
    const commands = planPushCommands(
      { userId, enabled, permissionGranted, token },
      registeredRef.current,
    );
    if (commands.length === 0) return;
    let cancelled = false;
    void (async () => {
      for (const command of commands) {
        if (cancelled) return;
        if (command.type === 'unregister') {
          const result = await pushService.unregisterPushToken(command.userId, command.token);
          if (result.ok && !cancelled) registeredRef.current = null;
        } else {
          const result = await pushService.registerPushToken(command.userId, command.token);
          if (result.ok && !cancelled) {
            registeredRef.current = { userId: command.userId, token: command.token };
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, enabled, permissionGranted, token]);

  // Load the persisted preference on mount and keep the UI honest if permission was revoked.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let stored = false;
      try {
        stored = parseStoredPreference(await AsyncStorage.getItem(NOTIF_STORAGE_KEY));
      } catch {
        stored = false;
      }
      if (cancelled) return;
      const granted = (await getPermissionStatus()) === 'granted';
      if (cancelled) return;
      setPermissionGranted(granted);
      if (stored && granted) {
        setEnabled(true);
        const tok = await getExpoPushToken();
        if (cancelled) return;
        setToken(tok);
      } else if (stored && !granted) {
        setEnabled(false);
        await persist(false);
      } else {
        setEnabled(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-fetch the Expo token when the device push token rotates.
  useEffect(() => {
    const subscription = addPushTokenChangeListener(() => {
      void (async () => {
        setToken(await getExpoPushToken());
      })();
    });
    return () => subscription.remove();
  }, []);

  const enable = useCallback(async () => {
    const status = await requestPermission();
    if (status !== 'granted') {
      showToast({ message: t('settings.notifications.permissionDenied'), variant: 'error' });
      return;
    }
    setPermissionGranted(true);
    await ensureAndroidChannel();
    setToken(await getExpoPushToken());
    await persist(true);
    setEnabled(true);
  }, [showToast, t]);

  const disable = useCallback(async () => {
    await persist(false);
    setEnabled(false);
  }, []);

  const toggle = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (enabled) {
        await disable();
      } else {
        await enable();
      }
    } finally {
      setBusy(false);
    }
  }, [busy, enabled, enable, disable]);

  const value = useMemo<SystemNotificationsContextValue>(
    () => ({ enabled, busy, toggle }),
    [enabled, busy, toggle],
  );

  return (
    <SystemNotificationsContext.Provider value={value}>
      {children}
    </SystemNotificationsContext.Provider>
  );
};

export const useSystemNotificationsContext = (): SystemNotificationsContextValue => {
  const ctx = useContext(SystemNotificationsContext);
  if (!ctx) {
    throw new Error('useSystemNotificationsContext must be used within SystemNotificationsProvider');
  }
  return ctx;
};
```

- [ ] **Step 2: Run the quality gate**

Run: `npm run typecheck` → Expected: 0 errors.
Run: `npm test` → Expected: green, ~183 tests (unchanged).

- [ ] **Step 3: Commit (checkpoint — only if user authorized commits)**

```bash
git add src/frontend/application/SystemNotificationsProvider.tsx
git commit -m "feat(push): add SystemNotificationsProvider with reconcile lifecycle"
```

---

## Task 4: `usePushNotificationReactions` hook

**Files:**
- Create: `src/frontend/hooks/usePushNotificationReactions.ts`

No unit test — React/expo shell, verified by typecheck. Unused until Task 5 wires it.

- [ ] **Step 1: Create the hook**

Create `src/frontend/hooks/usePushNotificationReactions.ts`:

```ts
import { useEffect } from 'react';
import { useNotifications } from '../application/NotificationsContext';
import { usePanelContext } from '../navigation/PanelContext';
import { addReceivedListener, addResponseListener } from '../notifications/systemNotifications';

/**
 * Wires incoming push notifications to the in-app UI: a foreground receive refreshes the
 * notifications panel + unread dot; a tap opens the notifications slide-over. Must be called
 * inside both NotificationsProvider and PanelContext (i.e. within PanelHost).
 */
export function usePushNotificationReactions(): void {
  const { refresh } = useNotifications();
  const { setOpenPanel } = usePanelContext();

  useEffect(() => {
    const received = addReceivedListener(() => {
      void refresh();
    });
    const response = addResponseListener(() => {
      setOpenPanel('notifications');
    });
    return () => {
      received.remove();
      response.remove();
    };
  }, [refresh, setOpenPanel]);
}
```

- [ ] **Step 2: Run the quality gate**

Run: `npm run typecheck` → Expected: 0 errors.
Run: `npm test` → Expected: green, ~183 tests (unchanged).

- [ ] **Step 3: Commit (checkpoint — only if user authorized commits)**

```bash
git add src/frontend/hooks/usePushNotificationReactions.ts
git commit -m "feat(push): add usePushNotificationReactions (foreground refresh + tap to panel)"
```

---

## Task 5: Wire `PanelHost`, migrate `SettingsScreen`, remove old hook

These three edits are interdependent (they swap the old hook for the provider), so they land together to keep the tree compiling.

**Files:**
- Modify: `src/frontend/navigation/PanelHost.tsx`
- Modify: `src/frontend/screens/profile/SettingsScreen.tsx` (lines 10 and 27)
- Delete: `src/frontend/hooks/useSystemNotifications.ts`

- [ ] **Step 1: Replace `PanelHost.tsx` contents**

Overwrite `src/frontend/navigation/PanelHost.tsx` with:

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { MainTabs } from './MainTabs';
import { SlideOverPanel } from '../components/layout/SlideOverPanel';
import { PanelContext, type PanelKind } from './PanelContext';
import { NotificationsProvider } from '../application/NotificationsContext';
import { SystemNotificationsProvider } from '../application/SystemNotificationsProvider';
import { useBackendHydration } from '../hooks/useBackendHydration';
import { usePushNotificationReactions } from '../hooks/usePushNotificationReactions';

/** Bridges incoming push notifications to the in-app panel; renders nothing. */
const PushReactionsBridge = () => {
  usePushNotificationReactions();
  return null;
};

export const PanelHost = () => {
  const [openPanel, setOpenPanel] = useState<PanelKind>(null);
  useBackendHydration();

  useEffect(() => {
    if (openPanel === null) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setOpenPanel(null);
      return true;
    });
    return () => subscription.remove();
  }, [openPanel]);

  const handleClose = useCallback(() => setOpenPanel(null), []);

  const contextValue = useMemo(() => ({ openPanel, setOpenPanel }), [openPanel]);

  return (
    <PanelContext.Provider value={contextValue}>
      <SystemNotificationsProvider>
        <NotificationsProvider>
          <View style={styles.container}>
            <PushReactionsBridge />
            <MainTabs />
            <SlideOverPanel panel={openPanel} onClose={handleClose} />
          </View>
        </NotificationsProvider>
      </SystemNotificationsProvider>
    </PanelContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

- [ ] **Step 2: Migrate `SettingsScreen.tsx`**

In `src/frontend/screens/profile/SettingsScreen.tsx`, replace the import on line 10:

```ts
import { useSystemNotifications } from '../../hooks/useSystemNotifications';
```

with:

```ts
import { useSystemNotificationsContext } from '../../application/SystemNotificationsProvider';
```

and replace the call on line 27:

```ts
  const systemNotifications = useSystemNotifications();
```

with:

```ts
  const systemNotifications = useSystemNotificationsContext();
```

(The JSX using `systemNotifications.enabled/busy/toggle` is unchanged — same surface.)

- [ ] **Step 3: Delete the old hook**

Run: `git rm src/frontend/hooks/useSystemNotifications.ts`
(If not committing yet: `rm src/frontend/hooks/useSystemNotifications.ts`.)

- [ ] **Step 4: Run the quality gate**

Run: `npm run typecheck` → Expected: 0 errors (no remaining import of `useSystemNotifications`; confirm with `grep -rn "useSystemNotifications\b" src/frontend` returning nothing but the provider's context hook).
Run: `npm test` → Expected: green, ~183 tests (unchanged).

- [ ] **Step 5: Commit (checkpoint — only if user authorized commits)**

```bash
git add src/frontend/navigation/PanelHost.tsx src/frontend/screens/profile/SettingsScreen.tsx
git rm src/frontend/hooks/useSystemNotifications.ts
git commit -m "refactor(push): wire provider+reactions in PanelHost, migrate Settings, drop old hook"
```

---

## Task 6: EAS config scaffolding

**Files:**
- Modify: `app.json`
- Create: `eas.json` (optional — for `eas build`)

- [ ] **Step 1: Add the `expo-notifications` plugin and `extra.eas.projectId`**

In `app.json`, add `"expo-notifications"` as the first entry of the `plugins` array, and add an `extra` block after `plugins`. The resulting `expo` object tail (from `plugins` onward) becomes:

```json
    "plugins": [
      "expo-notifications",
      "expo-asset",
      "expo-font",
      "expo-secure-store",
      "expo-localization",
      [
        "expo-image-picker",
        {
          "photosPermission": "EggJob needs access to your photos so you can set a profile picture and attach photos to your progress.",
          "cameraPermission": "EggJob needs access to your camera so you can take a profile picture or a progress photo.",
          "microphonePermission": false
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "REPLACE_WITH_EAS_PROJECT_ID"
      }
    }
```

> **User action required:** replace `REPLACE_WITH_EAS_PROJECT_ID` with the real id from expo.dev, or run `eas init` (which writes it for you). Until then `getExpoPushToken()` returns `null` and the app stays functional with no remote token.

- [ ] **Step 2: (Optional) Create `eas.json` for development builds**

Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

> `eas init` / `eas build` require your Expo account login and are run by you, not in this workspace.

- [ ] **Step 3: Verify config validity + quality gate**

Run: `node -e "JSON.parse(require('fs').readFileSync('app.json','utf8')); JSON.parse(require('fs').readFileSync('eas.json','utf8')); console.log('json ok')"`
Expected: `json ok`.
Run: `npm run typecheck` → Expected: 0 errors.
Run: `npm test` → Expected: green, ~183 tests (unchanged).

- [ ] **Step 4: Commit (checkpoint — only if user authorized commits)**

```bash
git add app.json eas.json
git commit -m "chore(push): scaffold expo-notifications plugin, EAS projectId slot, eas.json"
```

---

## Done criteria

- `npm run typecheck` = 0 errors; `npm test` green (~183).
- Toggle still works via the provider; registration now also fires on startup/login, token rotation, and user switch, and unregisters on logout (subject to the §6 logout-ordering contract).
- Foreground push refreshes the panel/dot; tapping a push opens the notifications panel.
- `app.json` carries the `expo-notifications` plugin and an `extra.eas.projectId` slot.

## Deferred / out of scope (from spec §12)

Per-task `params.notifications` flag · cold-start tap routing (`getLastNotificationResponseAsync`) · payload-based deep-linking · building the logout UI (only the unregister-ordering contract is documented) · running `eas init`/`eas build` and end-to-end device verification (gated on a real projectId + dev build).
