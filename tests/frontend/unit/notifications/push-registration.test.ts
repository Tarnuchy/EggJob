import { describe, expect, it } from 'vitest';
import {
  planPushCommands,
  type DesiredPushState,
  type PushRegistration,
} from '../../../../src/frontend/notifications/pushRegistration';

const on = (over: Partial<DesiredPushState> = {}): DesiredPushState => ({
  userId: 'u1',
  enabled: true,
  permissionGranted: true,
  token: 't1',
  ...over,
});

const reg = (userId: string, token: string): PushRegistration => ({ userId, token });

describe('planPushCommands', () => {
  it('does nothing when off and nothing is registered', () => {
    expect(planPushCommands(on({ enabled: false }), null)).toEqual([]);
  });

  it('registers when turning on with a token and nothing registered', () => {
    expect(planPushCommands(on(), null)).toEqual([
      { type: 'register', userId: 'u1', token: 't1' },
    ]);
  });

  it('does nothing when the desired registration already matches', () => {
    expect(planPushCommands(on(), reg('u1', 't1'))).toEqual([]);
  });

  it('re-registers (unregister old, register new) when the token rotates', () => {
    expect(planPushCommands(on({ token: 't2' }), reg('u1', 't1'))).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
      { type: 'register', userId: 'u1', token: 't2' },
    ]);
  });

  it('re-registers under the new user when the user switches', () => {
    expect(planPushCommands(on({ userId: 'u2' }), reg('u1', 't1'))).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
      { type: 'register', userId: 'u2', token: 't1' },
    ]);
  });

  it('unregisters on logout (userId becomes null)', () => {
    expect(planPushCommands(on({ userId: null }), reg('u1', 't1'))).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
    ]);
  });

  it('unregisters when the toggle is turned off', () => {
    expect(planPushCommands(on({ enabled: false }), reg('u1', 't1'))).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
    ]);
  });

  it('unregisters when OS permission is revoked', () => {
    expect(planPushCommands(on({ permissionGranted: false }), reg('u1', 't1'))).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
    ]);
  });

  it('churn guard: keeps registration when token is transiently null for the same user', () => {
    expect(planPushCommands(on({ token: null }), reg('u1', 't1'))).toEqual([]);
  });

  it('unregisters the stale user even when the new user has no token yet', () => {
    expect(planPushCommands(on({ userId: 'u2', token: null }), reg('u1', 't1'))).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
    ]);
  });

  it('does nothing when nothing is desired and nothing is registered (both null target)', () => {
    expect(planPushCommands(on({ token: null }), null)).toEqual([]);
  });

  it('converges across a rotate-then-switch sequence', () => {
    // start: register
    let registered: PushRegistration | null = null;
    const c1 = planPushCommands(on(), registered);
    expect(c1).toEqual([{ type: 'register', userId: 'u1', token: 't1' }]);
    registered = reg('u1', 't1');

    // token rotates
    const c2 = planPushCommands(on({ token: 't2' }), registered);
    expect(c2).toEqual([
      { type: 'unregister', userId: 'u1', token: 't1' },
      { type: 'register', userId: 'u1', token: 't2' },
    ]);
    registered = reg('u1', 't2');

    // user switches
    const c3 = planPushCommands(on({ userId: 'u2', token: 't2' }), registered);
    expect(c3).toEqual([
      { type: 'unregister', userId: 'u1', token: 't2' },
      { type: 'register', userId: 'u2', token: 't2' },
    ]);
  });
});
