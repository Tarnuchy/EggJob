import type { Result } from './index';

export interface NotificationItem {
  notificationId: string;
  message: string;
  /** `true` while unread (backend `active` flag). */
  active: boolean;
  /** ISO-8601 timestamp. */
  date: string;
}

export interface INotificationService {
  addNotification(input: {
    notificationId: string;
    userId: string;
    message: string;
  }): Promise<Result<void>>;

  markAsRead(notificationId: string): Promise<Result<void>>;

  markAllAsRead(userId: string): Promise<Result<void>>;

  /** Returns the user's notifications, newest first. */
  getNotifications(userId: string): Promise<Result<NotificationItem[]>>;
}
