import type { Result } from './index';

/**
 * Registers/removes a device's Expo push token for a user so the backend can deliver
 * remote push notifications. The backend endpoints are documented in the design spec.
 */
export interface IPushService {
  /** Registers the device's Expo push token for the user (idempotent). */
  registerPushToken(userId: string, token: string): Promise<Result<void>>;
  /** Removes the device's Expo push token for the user. */
  unregisterPushToken(userId: string, token: string): Promise<Result<void>>;
}
