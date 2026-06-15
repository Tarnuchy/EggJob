import { MockPushService } from '../../../../src/frontend/services/mock/MockPushService';

describe('MockPushService', () => {
  it('registers a push token for the user', async () => {
    const service = new MockPushService();
    const result = await service.registerPushToken('usr-1', 'ExponentPushToken[abc]');

    expect(result.ok).toBe(true);
    expect(service.getRegisteredTokens('usr-1')).toContain('ExponentPushToken[abc]');
  });

  it('does not store the same token twice', async () => {
    const service = new MockPushService();
    await service.registerPushToken('usr-1', 'token-1');
    await service.registerPushToken('usr-1', 'token-1');

    expect(service.getRegisteredTokens('usr-1')).toHaveLength(1);
  });

  it('unregisters a token', async () => {
    const service = new MockPushService();
    await service.registerPushToken('usr-1', 'token-1');

    const result = await service.unregisterPushToken('usr-1', 'token-1');

    expect(result.ok).toBe(true);
    expect(service.getRegisteredTokens('usr-1')).toHaveLength(0);
  });

  it('unregistering an unknown token is a no-op success', async () => {
    const service = new MockPushService();
    const result = await service.unregisterPushToken('usr-1', 'never-registered');

    expect(result.ok).toBe(true);
    expect(service.getRegisteredTokens('usr-1')).toHaveLength(0);
  });
});
