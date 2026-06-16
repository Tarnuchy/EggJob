import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/layout/TopBar';
import { TAB_BAR_HEIGHT } from '../../components/layout/tabs';
import { colors } from '../../theme/colors';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';
import { useAppState } from '../../application/AppStateContext';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useNotifications } from '../../application/NotificationsContext';
import { selectHomeActiveTasks, selectHomeGroupHighlights } from '../../application/selectors';
import { getGreetingKey } from './logic/greeting';
import { useHomeData } from './useHomeData';
import { GreetingHero } from './components/GreetingHero';
import { HomeNudges } from './components/HomeNudges';
import { StatsSnapshot } from './components/StatsSnapshot';
import { ActiveTasksPeek } from './components/ActiveTasksPeek';
import { GroupHighlights } from './components/GroupHighlights';
import { FriendsActivityFeed } from './components/FriendsActivityFeed';
import { HomeOnboarding } from './components/HomeOnboarding';

export const HomeScreen = () => {
  const { state } = useAppState();
  const currentUserId = useCurrentUserId();
  const navigation = useAppNavigation();
  const home = useHomeData(currentUserId);
  const notifications = useNotifications();

  const activeTasks = useMemo(
    () => selectHomeActiveTasks(state, currentUserId, 3),
    [state, currentUserId],
  );
  const groupHighlights = useMemo(
    () => selectHomeGroupHighlights(state, currentUserId, 6),
    [state, currentUserId],
  );

  const displayName = home.username ?? state.entities.users[currentUserId]?.username ?? '';
  const greetingKey = getGreetingKey(new Date().getHours());

  const isNewUser =
    !home.loading &&
    !home.error &&
    groupHighlights.length === 0 &&
    (home.stats?.friendsCount ?? 1) === 0 &&
    home.feed.length === 0;

  const onRefresh = () => {
    void home.refresh();
    void notifications.refresh();
  };

  return (
    <View style={styles.root}>
      <TopBar />
      <SafeAreaView style={styles.body} edges={['left', 'right', 'bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={home.refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <GreetingHero displayName={displayName} greetingKey={greetingKey} />

          {isNewUser ? (
            <HomeOnboarding />
          ) : (
            <>
              <HomeNudges pendingInvitations={home.pendingInvitations} />
              <StatsSnapshot stats={home.stats} onFriendsPress={() => navigation.navigate('Main', { screen: 'Friends' })} />
              <ActiveTasksPeek items={activeTasks} />
              <GroupHighlights items={groupHighlights} />
              <FriendsActivityFeed feed={home.feed} loading={home.loading} error={home.error} onRetry={onRefresh} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  content: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: spacing.md,
    paddingBottom: TAB_BAR_HEIGHT + spacing.lg,
    gap: spacing.md,
  },
});
