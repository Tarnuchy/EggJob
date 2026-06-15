import type { INotificationService, NotificationItem } from '../types/INotificationService';
import type { Page, PageOptions, Result } from '../types/index';
import { fetchAllPages, pageQueryString } from '../pagination';
import { API_BASE_URL } from './config';
import { buildAuthHeaders } from './buildAuthHeaders';

type NotificationPayload = {
  id: string;
  message: string;
  active: boolean;
  date: string;
};

function mapStatus(status: number): Result<never> {
  if (status === 400) return { ok: false, error: { code: 'validation' } };
  if (status === 401) return { ok: false, error: { code: 'unauthorized' } };
  if (status === 404) return { ok: false, error: { code: 'not-found' } };
  return { ok: false, error: { code: `http-${status}` } };
}

export class HttpNotificationService implements INotificationService {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

  async addNotification(input: {
    notificationId: string;
    userId: string;
    message: string;
  }): Promise<Result<void>> {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(input.userId)}/notifications`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: input.message }),
        },
      );
      if (!response.ok) return mapStatus(response.status);
      return { ok: true, value: undefined };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async markAsRead(notificationId: string): Promise<Result<void>> {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/notifications/${encodeURIComponent(notificationId)}/read`,
        { method: 'POST', headers },
      );
      if (!response.ok) return mapStatus(response.status);
      return { ok: true, value: undefined };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async markAllAsRead(userId: string): Promise<Result<void>> {
    // Mark every unread notification across ALL pages — explicit user action, not a hot path.
    const all = await fetchAllPages<NotificationItem>(
      (offset, limit) => this.getNotifications(userId, { offset, limit }),
      100,
    );
    if (!all.ok) return all;
    for (const notification of all.value) {
      if (!notification.active) continue;
      const result = await this.markAsRead(notification.notificationId);
      if (!result.ok) return result;
    }
    return { ok: true, value: undefined };
  }

  async getNotifications(
    userId: string,
    opts?: PageOptions,
  ): Promise<Result<Page<NotificationItem>>> {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(userId)}/notifications${pageQueryString(opts)}`,
        { method: 'GET', headers },
      );
      if (!response.ok) return mapStatus(response.status);
      const parsed = (await response.json()) as { items?: NotificationPayload[]; total?: number };
      const items: NotificationItem[] = (parsed.items ?? []).map((item) => ({
        notificationId: item.id,
        message: item.message,
        active: item.active,
        date: item.date,
      }));
      return { ok: true, value: { items, total: parsed.total ?? items.length } };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }
}

export const httpNotificationService = new HttpNotificationService();
