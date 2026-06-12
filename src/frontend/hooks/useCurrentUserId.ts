import { useAppState } from '../application/AppStateContext';
import { selectCurrentUserId } from '../application/selectors';

/**
 * Falls back to a seeded user so the app is usable in development before a
 * real session exists. Replace with a strict guard once auth is mandatory.
 */
export const DEV_FALLBACK_USER_ID = 'usr-seed-1';

export const useCurrentUserId = (): string => {
  const { state } = useAppState();
  return selectCurrentUserId(state) ?? DEV_FALLBACK_USER_ID;
};
