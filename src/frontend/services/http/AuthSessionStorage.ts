import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'eggjob.auth.session';

export type StoredSession = { accountId: string; userId: string };

/**
 * Persists the signed-in account/user ids alongside the auth token (see AuthTokenStorage), so a
 * returning user can be restored into the authenticated shell on cold start instead of being sent
 * back to the login screen. Stored as JSON in SecureStore; cleared on logout / account deletion.
 */
export const AuthSessionStorage = {
  async set(accountId: string, userId: string): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ accountId, userId }));
  },

  async get(): Promise<StoredSession | null> {
    try {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<StoredSession>;
      if (typeof parsed.accountId === 'string' && typeof parsed.userId === 'string') {
        return { accountId: parsed.accountId, userId: parsed.userId };
      }
      return null;
    } catch {
      return null;
    }
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
