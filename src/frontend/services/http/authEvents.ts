import { AuthTokenStorage } from './AuthTokenStorage';

/**
 * Decouples the HTTP layer from navigation: any authenticated request that gets a 401 calls
 * `notifyUnauthorized()`, which purges the stored token and invokes the registered handler
 * (set by the navigator) to drop the session and route back to the Auth screen. Avoids importing
 * navigation into every service.
 */
let handler: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null): void {
  handler = fn;
}

export function notifyUnauthorized(): void {
  void AuthTokenStorage.clearToken();
  handler?.();
}
