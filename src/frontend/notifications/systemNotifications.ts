import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Thin wrapper around `expo-notifications`. Isolates the native module so the rest of the
 * app (hook, settings UI) depends on a small, intention-revealing surface. Not unit-tested —
 * it only delegates to the native SDK (consistent with the repo's other native wrappers).
 */

// Foreground presentation behaviour — registered once when this module is first imported.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ANDROID_CHANNEL_ID = 'default';

export type PermissionResult = 'granted' | 'denied';

/** Current OS permission state without prompting. */
export async function getPermissionStatus(): Promise<PermissionResult> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted ? 'granted' : 'denied';
}

/** Prompts for OS notification permission (no-op prompt if already decided). */
export async function requestPermission(): Promise<PermissionResult> {
  const settings = await Notifications.requestPermissionsAsync();
  return settings.granted ? 'granted' : 'denied';
}

/** Android requires a channel before notifications display; safe no-op elsewhere. */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * The device's Expo push token, or `null` when it cannot be obtained (no EAS `projectId`,
 * running in Expo Go, or no physical device). Callers treat `null` as "remote push not
 * available yet" and skip backend registration without failing the toggle.
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const { data } = await Notifications.getExpoPushTokenAsync();
    return data ?? null;
  } catch {
    return null;
  }
}

/** Fires an immediate local notification — used to prove the toggle works without a backend. */
export async function presentTestNotification(title: string, body: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}
