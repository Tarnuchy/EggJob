import type { INotificationService } from "../types/INotificationService";
import type { Result } from "../types/index";

class MockNotificationService implements INotificationService {
  private notifications: Record<
    string,
    { userId: string; message: string; active: boolean }
  > = {};

  async addNotification(input: {
    notificationId: string;
    userId: string;
    message: string;
  }): Promise<Result<void>> {
    this.notifications[input.notificationId] = {
      userId: input.userId,
      message: input.message,
      active: true,
    };
    return { ok: true, value: undefined };
  }

  async markAsRead(notificationId: string): Promise<Result<void>> {
    const notification = this.notifications[notificationId];
    if (!notification) {
      return { ok: false, error: { code: "not-found" } };
    }
    notification.active = false;
    return { ok: true, value: undefined };
  }

  async getNotifications(
    userId: string
  ): Promise<
    Result<Array<{ notificationId: string; message: string; active: boolean }>>
  > {
    const result = Object.entries(this.notifications)
      .filter(([, notification]) => notification.userId === userId)
      .map(([notificationId, notification]) => ({
        notificationId,
        message: notification.message,
        active: notification.active,
      }));

    return { ok: true, value: result };
  }
}

export const mockNotificationService = new MockNotificationService();