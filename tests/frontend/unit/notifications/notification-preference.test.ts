import { describe, expect, it } from 'vitest';
import {
  NOTIF_STORAGE_KEY,
  parseStoredPreference,
  serializePreference,
} from '../../../../src/frontend/notifications/notificationPreference';

describe('system notification preference (pure)', () => {
  it('uses a namespaced storage key', () => {
    expect(NOTIF_STORAGE_KEY).toBe('@eggjob/system-notifications');
  });

  describe('parseStoredPreference', () => {
    it('treats the explicit enabled marker as on', () => {
      expect(parseStoredPreference('1')).toBe(true);
    });

    it('treats anything else as off (safe default)', () => {
      expect(parseStoredPreference('0')).toBe(false);
      expect(parseStoredPreference(null)).toBe(false);
      expect(parseStoredPreference(undefined)).toBe(false);
      expect(parseStoredPreference('true')).toBe(false);
      expect(parseStoredPreference('garbage')).toBe(false);
    });
  });

  describe('serializePreference', () => {
    it('round-trips through parseStoredPreference', () => {
      expect(parseStoredPreference(serializePreference(true))).toBe(true);
      expect(parseStoredPreference(serializePreference(false))).toBe(false);
    });
  });
});
