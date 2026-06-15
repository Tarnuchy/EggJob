import type { IPushService } from '../types/IPushService';
import type { Result } from '../types/index';

class MockPushService implements IPushService {
  private tokensByUser: Record<string, Set<string>> = {};

  async registerPushToken(userId: string, token: string): Promise<Result<void>> {
    (this.tokensByUser[userId] ??= new Set<string>()).add(token);
    return { ok: true, value: undefined };
  }

  async unregisterPushToken(userId: string, token: string): Promise<Result<void>> {
    this.tokensByUser[userId]?.delete(token);
    return { ok: true, value: undefined };
  }

  /** Test/inspection helper — not part of IPushService. */
  getRegisteredTokens(userId: string): string[] {
    return [...(this.tokensByUser[userId] ?? [])];
  }
}

export const mockPushService = new MockPushService();
export { MockPushService };
