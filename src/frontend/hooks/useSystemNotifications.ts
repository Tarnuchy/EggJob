import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { pushService } from '../services';
import { useCurrentUserId } from './useCurrentUserId';
import { useToast } from '../context/ToastContext';
import {
  NOTIF_STORAGE_KEY,
  parseStoredPreference,
  serializePreference,
} from '../notifications/notificationPreference';
import {
  ensureAndroidChannel,
  getExpoPushToken,
  getPermissionStatus,
  requestPermission,
} from '../notifications/systemNotifications';

interface UseSystemNotificationsResult {
  enabled: boolean;
  busy: boolean;
  toggle: () => Promise<void>;
}

async function persist(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIF_STORAGE_KEY, serializePreference(enabled));
  } catch {
    // a persistence failure must not block the in-session toggle
  }
}

/**
 * App-level system-notifications toggle: OS permission + Expo push-token registration,
 * persisted like the locale preference. Enabling requests permission, then (best effort)
 * registers the device's push token with the backend; disabling unregisters it.
 */
export function useSystemNotifications(): UseSystemNotificationsResult {
  const userId = useCurrentUserId();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  // Load the persisted preference, and keep the UI honest if the OS permission was revoked.
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
      if (!stored) {
        setEnabled(false);
        return;
      }
      const status = await getPermissionStatus();
      if (cancelled) return;
      if (status === 'granted') {
        setEnabled(true);
      } else {
        setEnabled(false);
        await persist(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = useCallback(async () => {
    const status = await requestPermission();
    if (status !== 'granted') {
      showToast({ message: t('settings.notifications.permissionDenied'), variant: 'error' });
      return;
    }
    await ensureAndroidChannel();
    const token = await getExpoPushToken();
    if (token) {
      await pushService.registerPushToken(userId, token);
    }
    await persist(true);
    setEnabled(true);
  }, [showToast, t, userId]);

  const disable = useCallback(async () => {
    const token = await getExpoPushToken();
    if (token) {
      await pushService.unregisterPushToken(userId, token);
    }
    await persist(false);
    setEnabled(false);
  }, [userId]);

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

  return { enabled, busy, toggle };
}
