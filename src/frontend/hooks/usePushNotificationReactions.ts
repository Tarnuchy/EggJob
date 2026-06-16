import { useEffect } from 'react';
import { useNotifications } from '../application/NotificationsContext';
import { usePanelContext } from '../navigation/PanelContext';
import { addReceivedListener, addResponseListener } from '../notifications/systemNotifications';

/**
 * Wires incoming push notifications to the in-app UI: a foreground receive refreshes the
 * notifications panel + unread dot; a tap opens the notifications slide-over. Must be called
 * inside both NotificationsProvider and PanelContext (i.e. within PanelHost).
 */
export function usePushNotificationReactions(): void {
  const { refresh } = useNotifications();
  const { setOpenPanel } = usePanelContext();

  useEffect(() => {
    const received = addReceivedListener(() => {
      void refresh();
    });
    const response = addResponseListener(() => {
      setOpenPanel('notifications');
    });
    return () => {
      received.remove();
      response.remove();
    };
  }, [refresh, setOpenPanel]);
}
