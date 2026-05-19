import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SearchBar } from '../../../components/common/SearchBar';
import { UserListItem } from '../../../components/common/UserListItem';
import { EmptyState } from '../../../components/common/EmptyState';
import { AppText } from '../../../components/common/AppText';
import { socialService } from '../../../services';
import { strings } from '../../../i18n/strings';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { useCurrentUserId } from './useCurrentUserId';
import type { ResolvedUser } from './types';

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const AddFriendTab = () => {
  const currentUserId = useCurrentUserId();
  const navigation = useAppNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResolvedUser[]>([]);
  const [pendingUserIds, setPendingUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(
    async (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      if (!trimmed) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const result = await socialService.searchUsers(trimmed, currentUserId);
      if (result.ok) {
        setResults(result.value);
      } else {
        setResults([]);
      }
      setLoading(false);
    },
    [currentUserId],
  );

  useEffect(() => {
    void searchUsers(query);
  }, [query, searchUsers]);

  const handleInvite = async (toUserId: string) => {
    if (pendingUserIds.has(toUserId)) return;
    const next = new Set(pendingUserIds);
    next.add(toUserId);
    setPendingUserIds(next);

    const invitationId = generateId('inv');
    const result = await socialService.inviteFriend({
      invitationId,
      fromUserId: currentUserId,
      toUserId,
    });
    if (!result.ok) {
      const rollback = new Set(pendingUserIds);
      rollback.delete(toUserId);
      setPendingUserIds(rollback);
    }
  };

  const handleOpenProfile = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={strings.friends.searchPlaceholder}
      />
      {!hasQuery ? (
        <EmptyState
          icon="search-outline"
          title={strings.friends.empty.addFriendTitle}
          message={strings.friends.empty.addFriendMessage}
        />
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : results.length === 0 ? (
        <EmptyState
          icon="person-outline"
          title={strings.friends.empty.addFriendTitle}
          message={strings.friends.empty.addFriendNoResults}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isPending = pendingUserIds.has(item.userId);
            return (
              <UserListItem
                username={item.username}
                photoUrl={item.photoUrl}
                onPress={() => handleOpenProfile(item.userId)}
                right={
                  <Pressable
                    onPress={() => handleInvite(item.userId)}
                    disabled={isPending}
                    style={({ pressed }) => [
                      styles.actionButton,
                      isPending && styles.actionButtonPending,
                      pressed && !isPending && styles.actionButtonPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isPending ? strings.friends.actions.pending : strings.friends.actions.add
                    }
                  >
                    <AppText
                      variant="button"
                      color={isPending ? 'muted' : 'textOnPrimary'}
                    >
                      {isPending ? strings.friends.actions.pending : strings.friends.actions.add}
                    </AppText>
                  </Pressable>
                }
              />
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.primary,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  actionButtonPending: {
    backgroundColor: colors.tabSwitcherTrack,
  },
});
