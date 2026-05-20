export type FriendRelationship =
  | { status: 'self' }
  | { status: 'none' }
  | { status: 'friend'; friendshipId: string }
  | { status: 'invite-sent'; invitationId: string }
  | { status: 'invite-received'; invitationId: string };

export type FriendRelationshipStatus = FriendRelationship['status'];

interface DeriveInput {
  currentUserId: string;
  targetUserId: string;
  friends: Array<{ friendshipId: string; friendUserId: string }>;
  sentInvitations: Array<{ invitationId: string; toUserId: string }>;
  receivedInvitations: Array<{ invitationId: string; fromUserId: string }>;
}

/**
 * Resolves how the current user relates to `targetUserId`. An existing
 * friendship wins; a received invitation is preferred over a sent one so the
 * profile can offer Accept/Reject rather than a stale Cancel.
 */
export function deriveFriendRelationship(input: DeriveInput): FriendRelationship {
  if (input.currentUserId === input.targetUserId) {
    return { status: 'self' };
  }

  const friend = input.friends.find((f) => f.friendUserId === input.targetUserId);
  if (friend) {
    return { status: 'friend', friendshipId: friend.friendshipId };
  }

  const received = input.receivedInvitations.find((i) => i.fromUserId === input.targetUserId);
  if (received) {
    return { status: 'invite-received', invitationId: received.invitationId };
  }

  const sent = input.sentInvitations.find((i) => i.toUserId === input.targetUserId);
  if (sent) {
    return { status: 'invite-sent', invitationId: sent.invitationId };
  }

  return { status: 'none' };
}
