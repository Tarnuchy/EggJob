import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { notificationService } from '../services';
import type { NotificationItem } from '../services';
import { useCurrentUserId } from '../hooks/useCurrentUserId';

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

/**
 * Holds the current user's notifications once for the whole authenticated
 * shell, so the panel list and the top-bar unread badge stay in sync.
 */
export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const userId = useCurrentUserId();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    const result = await notificationService.getNotifications(userId);
    if (result.ok) {
      setNotifications(result.value);
    } else {
      setNotifications([]);
      setError(true);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((item) =>
          item.notificationId === notificationId ? { ...item, active: false } : item,
        ),
      );
      const result = await notificationService.markAsRead(notificationId);
      if (!result.ok) {
        void refresh();
      }
    },
    [refresh],
  );

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, active: false })));
    const result = await notificationService.markAllAsRead(userId);
    if (!result.ok) {
      void refresh();
    }
  }, [refresh, userId]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.active).length,
    [notifications],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({ notifications, unreadCount, loading, error, refresh, markAsRead, markAllAsRead }),
    [notifications, unreadCount, loading, error, refresh, markAsRead, markAllAsRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = (): NotificationsContextValue => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return ctx;
};
