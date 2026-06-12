import type { IProfileService, UserStats } from '../types/IProfileService';
import type { Result } from '../types/index';
import { API_BASE_URL } from './config';
import { buildAuthHeaders } from './buildAuthHeaders';

type UserSummaryPayload = {
  id?: string;
  username?: string;
  photo_url?: string | null;
};

type UserStatsPayload = {
  active_tasks?: number;
  completed_tasks?: number;
  friends_count?: number;
};

function mapStatus(status: number): Result<never> {
  if (status === 400) return { ok: false, error: { code: 'validation' } };
  if (status === 401) return { ok: false, error: { code: 'unauthorized' } };
  if (status === 404) return { ok: false, error: { code: 'not-found' } };
  return { ok: false, error: { code: `http-${status}` } };
}

export class HttpProfileService implements IProfileService {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

  async editProfile(
    userId: string,
    input: { username?: string; photoUrl?: string },
  ): Promise<Result<void>> {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(userId)}/profile`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ username: input.username, photo_url: input.photoUrl }),
      });
      if (!response.ok) return mapStatus(response.status);
      return { ok: true, value: undefined };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async deleteAccount(_accountId: string, _userId: string): Promise<Result<void>> {
    // backend wymaga hasła (POST /accounts/{id}/delete), którego ten interfejs nie przekazuje
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async getProfile(userId: string): Promise<Result<{ username: string; photoUrl?: string }>> {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) return mapStatus(response.status);
      const parsed = (await response.json()) as UserSummaryPayload;
      return {
        ok: true,
        value: {
          username: parsed.username ?? '',
          photoUrl: parsed.photo_url ?? undefined,
        },
      };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async getUserStats(userId: string): Promise<Result<UserStats>> {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(userId)}/stats`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) return mapStatus(response.status);
      const parsed = (await response.json()) as UserStatsPayload;
      return {
        ok: true,
        value: {
          activeTasks: parsed.active_tasks ?? 0,
          completedTasks: parsed.completed_tasks ?? 0,
          friendsCount: parsed.friends_count ?? 0,
        },
      };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }
}

export const httpProfileService = new HttpProfileService();
