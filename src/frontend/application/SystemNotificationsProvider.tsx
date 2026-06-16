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
