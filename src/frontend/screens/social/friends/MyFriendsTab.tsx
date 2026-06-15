import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SearchBar } from '../../../components/common/SearchBar';
import { UserListItem } from '../../../components/common/UserListItem';
import { EmptyState } from '../../../components/common/EmptyState';
import { useTranslation } from 'react-i18next';
import { socialService } from '../../../services';
import { usePaginatedList } from '../../../hooks/usePaginatedList';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { useCurrentUserId } from './useCurrentUserId';

export const MyFriendsTab = () => {
  const currentUserId = useCurrentUserId();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const fetchPage = useCallback(
    (offset: number, limit: number) => socialService.getFriends(currentUserId, { offset, limit }),
    [currentUserId],
  );
  const { items, loading, loadingMore, loadMore } = usePaginatedList(fetchPage);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    // filters the loaded pages only — there is no friends-search endpoint (see spec)
    return items.filter((friend) => friend.username.toLowerCase().includes(needle));
  }, [items, query]);

  const handleOpenProfile = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('friends.searchPlaceholder')}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={t('friends.empty.myFriendsTitle')}
          message={t('friends.empty.myFriendsMessage')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.friendshipId}
          contentContainerStyle={styles.listContent}
          onEndReached={() => loadMore()}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={colors.primary} style={styles.footer} />
            ) : null
          }
          renderItem={({ item }) => (
            <UserListItem
              username={item.username}
              photoUrl={item.photoUrl}
              onPress={() => handleOpenProfile(item.friendUserId)}
            />
          )}
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
  footer: {
    paddingVertical: spacing.md,
  },
});
