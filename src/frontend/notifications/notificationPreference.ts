/**
 * Pure persistence helpers for the app-level "system notifications" toggle.
 * No React/native imports — testable in the `node` test env. The native wrapper and the
 * hook build on top of these (mirrors the locale-preference pattern in LocaleContext).
 */

/** AsyncStorage key for the system-notifications toggle. */
export const NOTIF_STORAGE_KEY = '@eggjob/system-notifications';

const ENABLED_MARKER = '1';
const DISABLED_MARKER = '0';

/** Parses a stored value into the toggle state. Defaults to `false` (off) for anything unexpected. */
export function parseStoredPreference(raw: string | null | undefined): boolean {
  return raw === ENABLED_MARKER;
}

/** Serialises the toggle state for storage. */
export function serializePreference(enabled: boolean): string {
  return enabled ? ENABLED_MARKER : DISABLED_MARKER;
}
