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
