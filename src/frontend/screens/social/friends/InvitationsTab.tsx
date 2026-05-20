import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../../../components/common/SearchBar';
import { UserListItem } from '../../../components/common/UserListItem';
import { EmptyState } from '../../../components/common/EmptyState';
import { useTranslation } from 'react-i18next';
import { profileService, socialService } from '../../../services';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { useCurrentUserId } from './useCurrentUserId';
import type { ResolvedInvitation } from './types';

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const InvitationsTab = () => {
  const currentUserId = useCurrentUserId();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [invitations, setInvitations] = useState<ResolvedInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    const result = await socialService.getPendingInvitations(currentUserId);
    if (!result.ok) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    const resolved = await Promise.all(
      result.value.map(async ({ invitationId, fromUserId }) => {
        const profile = await profileService.getProfile(fromUserId);
        const username = profile.ok ? profile.value.username : t('friends.profile.unknownUser');
        const photoUrl = profile.ok ? profile.value.photoUrl : undefined;
        return { invitationId, userId: fromUserId, username, photoUrl };
      }),
    );

    setInvitations(resolved);
    setLoading(false);
  }, [currentUserId, t]);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return invitations;
    return invitations.filter((inv) => inv.username.toLowerCase().includes(needle));
  }, [invitations, query]);

  const handleAccept = async (invitationId: string) => {
    const friendshipId = generateId('fr');
    const result = await socialService.acceptFriendInvite({ invitationId, friendshipId });
    if (result.ok) {
      setInvitations((prev) => prev.filter((inv) => inv.invitationId !== invitationId));
    }
  };

  const handleReject = async (invitationId: string) => {
    const result = await socialService.rejectFriendInvite(invitationId);
    if (result.ok) {
      setInvitations((prev) => prev.filter((inv) => inv.invitationId !== invitationId));
    }
  };

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
      ) : invitations.length === 0 ? (
        <EmptyState
          icon="mail-open-outline"
          title={t('friends.empty.invitationsTitle')}
          message={t('friends.empty.invitationsMessage')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.invitationId}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <UserListItem
              username={item.username}
              photoUrl={item.photoUrl}
              onPress={() => handleOpenProfile(item.userId)}
              right={
                <>
                  <Pressable
                    onPress={() => handleAccept(item.invitationId)}
                    style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    accessibilityRole="button"
                    accessibilityLabel={t('friends.actions.accept')}
                  >
                    <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleReject(item.invitationId)}
                    style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    accessibilityRole="button"
                    accessibilityLabel={t('friends.actions.reject')}
                  >
                    <Ionicons name="close-circle" size={28} color={colors.danger} />
                  </Pressable>
                </>
              }
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
  iconButton: {
    padding: 2,
    borderRadius: 999,
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
});
