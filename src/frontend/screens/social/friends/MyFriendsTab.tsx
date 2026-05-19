import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SearchBar } from '../../../components/common/SearchBar';
import { UserListItem } from '../../../components/common/UserListItem';
import { EmptyState } from '../../../components/common/EmptyState';
import { profileService, socialService } from '../../../services';
import { strings } from '../../../i18n/strings';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { useCurrentUserId } from './useCurrentUserId';
import type { ResolvedFriend } from './types';

export const MyFriendsTab = () => {
  const currentUserId = useCurrentUserId();
  const navigation = useAppNavigation();
  const [query, setQuery] = useState('');
  const [friends, setFriends] = useState<ResolvedFriend[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    setLoading(true);
    const result = await socialService.getFriends(currentUserId);
    if (!result.ok) {
      setFriends([]);
      setLoading(false);
      return;
    }

    const resolved = await Promise.all(
      result.value.map(async ({ friendshipId, friendUserId }) => {
        const profile = await profileService.getProfile(friendUserId);
        const username = profile.ok ? profile.value.username : strings.friends.profile.unknownUser;
        const photoUrl = profile.ok ? profile.value.photoUrl : undefined;
        return { friendshipId, userId: friendUserId, username, photoUrl };
      }),
    );

    setFriends(resolved);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return friends;
    return friends.filter((friend) => friend.username.toLowerCase().includes(needle));
  }, [friends, query]);

  const handleOpenProfile = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={strings.friends.searchPlaceholder}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : friends.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={strings.friends.empty.myFriendsTitle}
          message={strings.friends.empty.myFriendsMessage}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.friendshipId}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <UserListItem
              username={item.username}
              photoUrl={item.photoUrl}
              onPress={() => handleOpenProfile(item.userId)}
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
});
