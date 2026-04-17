import type { Result } from "./index";

export interface INotificationService {
  addNotification(input: {
    notificationId: string;
    userId: string;
    message: string;
  }): Promise<Result<void>>;

  markAsRead(notificationId: string): Promise<Result<void>>;

  getNotifications(userId: string): Promise<
    Result<
      Array<{
        notificationId: string;
        message: string;
        active: boolean;
      }>
    >
  >;
}