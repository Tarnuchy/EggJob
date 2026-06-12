import type { Result } from './index';

export interface UserSearchResult {
  userId: string;
  username: string;
  photoUrl?: string;
}

export type FeedItemType = 'progress_entry' | 'comment';

export interface FeedItem {
  type: FeedItemType;
  /** ISO-8601 timestamp. */
  createdAt: string;
  userId: string;
  username: string;
  taskId?: string;
  groupId?: string;
  message: string;
  value?: number;
}

export interface ISocialService {
  inviteFriend(input: {
    invitationId: string;
    fromUserId: string;
    toUserId: string;
  }): Promise<Result<void>>;

  acceptFriendInvite(input: { invitationId: string; friendshipId: string }): Promise<Result<void>>;

  rejectFriendInvite(invitationId: string): Promise<Result<void>>;

  /** Withdraws an invitation the current user has sent. */
  cancelInvitation(invitationId: string): Promise<Result<void>>;

  removeFriend(friendshipId: string): Promise<Result<void>>;

  getFriends(userId: string): Promise<
    Result<
      Array<{
        friendshipId: string;
        friendUserId: string;
      }>
    >
  >;

  /** Invitations the user has received and not yet answered. */
  getPendingInvitations(userId: string): Promise<
    Result<
      Array<{
        invitationId: string;
        fromUserId: string;
      }>
    >
  >;

  /** Invitations the user has sent and that are still pending. */
  getSentInvitations(userId: string): Promise<
    Result<
      Array<{
        invitationId: string;
        toUserId: string;
      }>
    >
  >;

  searchUsers(query: string, currentUserId: string): Promise<Result<UserSearchResult[]>>;

  /** Activity of the user's friends in shared task groups, newest first. */
  getUserFeed(userId: string): Promise<Result<FeedItem[]>>;
}
