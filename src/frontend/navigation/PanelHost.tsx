import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { MainTabs } from './MainTabs';
import { SlideOverPanel } from '../components/layout/SlideOverPanel';
import { PanelContext, type PanelKind } from './PanelContext';
import { NotificationsProvider } from '../application/NotificationsContext';
import { SystemNotificationsProvider } from '../application/SystemNotificationsProvider';
import { useBackendHydration } from '../hooks/useBackendHydration';
import { usePushNotificationReactions } from '../hooks/usePushNotificationReactions';

/** Bridges incoming push notifications to the in-app panel; renders nothing. */
const PushReactionsBridge = () => {
  usePushNotificationReactions();
  return null;
};

export const PanelHost = () => {
  const [openPanel, setOpenPanel] = useState<PanelKind>(null);
  useBackendHydration();

  useEffect(() => {
    if (openPanel === null) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setOpenPanel(null);
      return true;
    });
    return () => subscription.remove();
  }, [openPanel]);

  const handleClose = useCallback(() => setOpenPanel(null), []);

  const contextValue = useMemo(() => ({ openPanel, setOpenPanel }), [openPanel]);

  return (
    <PanelContext.Provider value={contextValue}>
      <SystemNotificationsProvider>
        <NotificationsProvider>
          <View style={styles.container}>
            <PushReactionsBridge />
            <MainTabs />
            <SlideOverPanel panel={openPanel} onClose={handleClose} />
          </View>
        </NotificationsProvider>
      </SystemNotificationsProvider>
    </PanelContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
