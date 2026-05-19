import type { Result } from './index';

export interface UserSearchResult {
  userId: string;
  username: string;
  photoUrl?: string;
}

export interface ISocialService {
  inviteFriend(input: {
    invitationId: string;
    fromUserId: string;
    toUserId: string;
  }): Promise<Result<void>>;

  acceptFriendInvite(input: { invitationId: string; friendshipId: string }): Promise<Result<void>>;

  rejectFriendInvite(invitationId: string): Promise<Result<void>>;

  removeFriend(friendshipId: string): Promise<Result<void>>;

  getFriends(userId: string): Promise<
    Result<
      Array<{
        friendshipId: string;
        friendUserId: string;
      }>
    >
  >;

  getPendingInvitations(userId: string): Promise<
    Result<
      Array<{
        invitationId: string;
        fromUserId: string;
      }>
    >
  >;

  searchUsers(query: string, currentUserId: string): Promise<Result<UserSearchResult[]>>;
}
