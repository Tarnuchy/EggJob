import type { IPushService } from '../types/IPushService';
import type { Result } from '../types/index';
import { API_BASE_URL } from './config';
import { buildAuthHeaders } from './buildAuthHeaders';

function mapStatus(status: number): Result<never> {
  if (status === 400) return { ok: false, error: { code: 'validation' } };
  if (status === 401) return { ok: false, error: { code: 'unauthorized' } };
  if (status === 404) return { ok: false, error: { code: 'not-found' } };
  return { ok: false, error: { code: `http-${status}` } };
}

export class HttpPushService implements IPushService {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

  async registerPushToken(userId: string, token: string): Promise<Result<void>> {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(userId)}/push-token`,
        { method: 'POST', headers, body: JSON.stringify({ token }) },
      );
      if (!response.ok) return mapStatus(response.status);
      return { ok: true, value: undefined };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async unregisterPushToken(userId: string, token: string): Promise<Result<void>> {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(userId)}/push-token`,
        { method: 'DELETE', headers, body: JSON.stringify({ token }) },
      );
      if (!response.ok) return mapStatus(response.status);
      return { ok: true, value: undefined };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }
}

export const httpPushService = new HttpPushService();
