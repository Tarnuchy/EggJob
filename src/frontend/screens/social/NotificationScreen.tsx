import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../components/common/AppText';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { useNotifications } from '../../application/NotificationsContext';
import { colors } from '../../theme/colors';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';
import { NotificationItem } from './components/NotificationItem';

export const NotificationScreen = () => {
  const { t } = useTranslation();
  const { notifications, hasUnread, loading, loadingMore, error, markAsRead, markAllAsRead, loadMore } =
    useNotifications();

  if (loading) {
    return (
      <View style={styles.center}>
        <LoadingIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <EmptyState icon="warning-outline" title={t('reducerErrors.unknown')} />
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.notificationId}
      style={styles.list}
      contentContainerStyle={[
        styles.content,
        notifications.length === 0 && styles.contentEmpty,
      ]}
      onEndReached={() => loadMore()}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={
        hasUnread ? (
          <Pressable
            onPress={() => void markAllAsRead()}
            style={({ pressed }) => [styles.markAll, pressed && styles.markAllPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('notifications.markAllAsRead')}
          >
            <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
            <AppText variant="button" color="primary">
              {t('notifications.markAllAsRead')}
            </AppText>
          </Pressable>
        ) : null
      }
      ListFooterComponent={
        loadingMore ? <ActivityIndicator color={colors.primary} style={styles.footer} /> : null
      }
      ListEmptyComponent={
        <EmptyState
          icon="notifications-outline"
          title={t('notifications.empty.title')}
          message={t('notifications.empty.message')}
        />
      }
      renderItem={({ item }) => (
        <NotificationItem item={item} onPress={() => void markAsRead(item.notificationId)} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  contentEmpty: {
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING_H,
  },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: 999,
  },
  markAllPressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.08)',
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
