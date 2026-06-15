import { useCallback, useEffect, useState } from 'react';
import { socialService } from '../../../services';
import { fetchAllPages } from '../../../services/pagination';
import { useCurrentUserId } from '../../../hooks/useCurrentUserId';
import {
  deriveFriendRelationship,
  type FriendRelationship,
} from '../../../utils/friendRelationship';

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

interface UseFriendRelationshipResult {
  relationship: FriendRelationship | null;
  loading: boolean;
  busy: boolean;
  addFriend: () => Promise<void>;
  removeFriend: () => Promise<void>;
  cancelInvite: () => Promise<void>;
  acceptInvite: () => Promise<void>;
  rejectInvite: () => Promise<void>;
}

/**
 * Resolves the viewer's relationship with `targetUserId` and exposes the
 * friend-graph actions, each of which re-derives the relationship on success.
 */
export function useFriendRelationship(targetUserId: string): UseFriendRelationshipResult {
  const currentUserId = useCurrentUserId();
  const [relationship, setRelationship] = useState<FriendRelationship | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [friends, sent, received] = await Promise.all([
      // relationship derivation needs the COMPLETE friend set, not just the first page
      fetchAllPages((offset, limit) => socialService.getFriends(currentUserId, { offset, limit })),
      socialService.getSentInvitations(currentUserId),
      socialService.getPendingInvitations(currentUserId),
    ]);
    setRelationship(
      deriveFriendRelationship({
        currentUserId,
        targetUserId,
        friends: friends.ok ? friends.value : [],
        sentInvitations: sent.ok ? sent.value : [],
        receivedInvitations: received.ok ? received.value : [],
      }),
    );
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const runAction = useCallback(
    async (fn: () => Promise<void>) => {
      setBusy(true);
      try {
        await fn();
        await load();
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  const addFriend = useCallback(
    () =>
      runAction(async () => {
        await socialService.inviteFriend({
          invitationId: generateId('inv'),
          fromUserId: currentUserId,
          toUserId: targetUserId,
        });
      }),
    [runAction, currentUserId, targetUserId],
  );

  const removeFriend = useCallback(
    () =>
      runAction(async () => {
        if (relationship?.status !== 'friend') return;
        await socialService.removeFriend(relationship.friendshipId);
      }),
    [runAction, relationship],
  );

  const cancelInvite = useCallback(
    () =>
      runAction(async () => {
        if (relationship?.status !== 'invite-sent') return;
        await socialService.cancelInvitation(relationship.invitationId);
      }),
    [runAction, relationship],
  );

  const acceptInvite = useCallback(
    () =>
      runAction(async () => {
        if (relationship?.status !== 'invite-received') return;
        await socialService.acceptFriendInvite({
          invitationId: relationship.invitationId,
          friendshipId: generateId('fr'),
        });
      }),
    [runAction, relationship],
  );

  const rejectInvite = useCallback(
    () =>
      runAction(async () => {
        if (relationship?.status !== 'invite-received') return;
        await socialService.rejectFriendInvite(relationship.invitationId);
      }),
    [runAction, relationship],
  );

  return {
    relationship,
    loading,
    busy,
    addFriend,
    removeFriend,
    cancelInvite,
    acceptInvite,
    rejectInvite,
  };
}
