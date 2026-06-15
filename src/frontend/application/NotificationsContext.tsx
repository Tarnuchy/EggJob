import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { notificationService } from '../services';
import type { NotificationItem } from '../services';
import { useCurrentUserId } from '../hooks/useCurrentUserId';
import { usePaginatedList } from '../hooks/usePaginatedList';

interface NotificationsContextValue {
  notifications: NotificationItem[];
  /** Whether any loaded notification is unread (drives the dot indicator). */
  hasUnread: boolean;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: boolean;
  loadMore: () => void;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

/**
 * Holds the current user's notifications (paginated) once for the whole authenticated
 * shell, so the panel list and the top-bar unread dot stay in sync.
 */
export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const userId = useCurrentUserId();

  const fetchPage = useCallback(
    (offset: number, limit: number) => notificationService.getNotifications(userId, { offset, limit }),
    [userId],
  );

  const { items, loading, loadingMore, error, hasMore, loadMore, refresh, mutateItems } =
    usePaginatedList<NotificationItem>(fetchPage);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      mutateItems((prev) =>
        prev.map((item) =>
          item.notificationId === notificationId ? { ...item, active: false } : item,
        ),
      );
      const result = await notificationService.markAsRead(notificationId);
      if (!result.ok) {
        void refresh();
      }
    },
    [mutateItems, refresh],
  );

  const markAllAsRead = useCallback(async () => {
    mutateItems((prev) => prev.map((item) => ({ ...item, active: false })));
    const result = await notificationService.markAllAsRead(userId);
    if (!result.ok) {
      void refresh();
    }
  }, [mutateItems, refresh, userId]);

  const hasUnread = useMemo(() => items.some((item) => item.active), [items]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications: items,
      hasUnread,
      loading,
      loadingMore,
      hasMore,
      error,
      loadMore,
      refresh,
      markAsRead,
      markAllAsRead,
    }),
    [items, hasUnread, loading, loadingMore, hasMore, error, loadMore, refresh, markAsRead, markAllAsRead],
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
