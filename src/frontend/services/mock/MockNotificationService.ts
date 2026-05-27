import type { INotificationService, NotificationItem } from '../types/INotificationService';
import type { Result } from '../types/index';

interface StoredNotification {
  userId: string;
  message: string;
  active: boolean;
  date: string;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();

class MockNotificationService implements INotificationService {
  private notifications: Record<string, StoredNotification> = {
    'ntf-seed-1': {
      userId: 'usr-seed-1',
      message: 'charlie sent you a friend request.',
      active: true,
      date: new Date(now - 2 * HOUR).toISOString(),
    },
    'ntf-seed-2': {
      userId: 'usr-seed-1',
      message: 'bob accepted your friend request.',
      active: true,
      date: new Date(now - 8 * HOUR).toISOString(),
    },
    'ntf-seed-3': {
      userId: 'usr-seed-1',
      message: 'A task in "Morning Routine" is due tomorrow.',
      active: false,
      date: new Date(now - 2 * DAY).toISOString(),
    },
    'ntf-seed-4': {
      userId: 'usr-seed-1',
      message: 'erin commented on your progress update.',
      active: false,
      date: new Date(now - 9 * DAY).toISOString(),
    },
  };

  async addNotification(input: {
    notificationId: string;
    userId: string;
    message: string;
  }): Promise<Result<void>> {
    this.notifications[input.notificationId] = {
      userId: input.userId,
      message: input.message,
      active: true,
      date: new Date().toISOString(),
    };
    return { ok: true, value: undefined };
  }

  async markAsRead(notificationId: string): Promise<Result<void>> {
    const notification = this.notifications[notificationId];
    if (!notification) {
      return { ok: false, error: { code: 'not-found' } };
    }
    notification.active = false;
    return { ok: true, value: undefined };
  }

  async markAllAsRead(userId: string): Promise<Result<void>> {
    for (const notification of Object.values(this.notifications)) {
      if (notification.userId === userId) {
        notification.active = false;
      }
    }
    return { ok: true, value: undefined };
  }

  async getNotifications(userId: string): Promise<Result<NotificationItem[]>> {
    const items = Object.entries(this.notifications)
      .filter(([, notification]) => notification.userId === userId)
      .map(([notificationId, notification]) => ({
        notificationId,
        message: notification.message,
        active: notification.active,
        date: notification.date,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return { ok: true, value: items };
  }
}

export const mockNotificationService = new MockNotificationService();
export { MockNotificationService };
