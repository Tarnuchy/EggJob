import type { ISocialService, UserSearchResult } from '../types/ISocialService';
import type { Result } from '../types/index';
import { mockProfileService } from './MockProfileService';

class MockSocialService implements ISocialService {
  private invitations: Record<string, { fromUserId: string; toUserId: string }> = {
    'inv-seed-1': { fromUserId: 'usr-seed-3', toUserId: 'usr-seed-1' },
    'inv-seed-2': { fromUserId: 'usr-seed-4', toUserId: 'usr-seed-1' },
  };

  private friendships: Record<string, { userId: string; friendUserId: string }> = {
    'fr-seed-1': { userId: 'usr-seed-1', friendUserId: 'usr-seed-2' },
    'fr-seed-2': { userId: 'usr-seed-1', friendUserId: 'usr-seed-5' },
  };

  async inviteFriend(input: {
    invitationId: string;
    fromUserId: string;
    toUserId: string;
  }): Promise<Result<void>> {
    this.invitations[input.invitationId] = {
      fromUserId: input.fromUserId,
      toUserId: input.toUserId,
    };
    return { ok: true, value: undefined };
  }

  async acceptFriendInvite(input: {
    invitationId: string;
    friendshipId: string;
  }): Promise<Result<void>> {
    const invitation = this.invitations[input.invitationId];
    if (!invitation) {
      return { ok: false, error: { code: 'not-found' } };
    }

    delete this.invitations[input.invitationId];
    this.friendships[input.friendshipId] = {
      userId: invitation.fromUserId,
      friendUserId: invitation.toUserId,
    };
    return { ok: true, value: undefined };
  }

  async rejectFriendInvite(invitationId: string): Promise<Result<void>> {
    delete this.invitations[invitationId];
    return { ok: true, value: undefined };
  }

  async removeFriend(friendshipId: string): Promise<Result<void>> {
    delete this.friendships[friendshipId];
    return { ok: true, value: undefined };
  }

  async getFriends(
    userId: string,
  ): Promise<Result<Array<{ friendshipId: string; friendUserId: string }>>> {
    const result = Object.entries(this.friendships)
      .filter(
        ([, friendship]) => friendship.userId === userId || friendship.friendUserId === userId,
      )
      .map(([friendshipId, friendship]) => ({
        friendshipId,
        friendUserId: friendship.userId === userId ? friendship.friendUserId : friendship.userId,
      }));

    return { ok: true, value: result };
  }

  async getPendingInvitations(
    userId: string,
  ): Promise<Result<Array<{ invitationId: string; fromUserId: string }>>> {
    const result = Object.entries(this.invitations)
      .filter(([, invitation]) => invitation.toUserId === userId)
      .map(([invitationId, invitation]) => ({
        invitationId,
        fromUserId: invitation.fromUserId,
      }));

    return { ok: true, value: result };
  }

  async searchUsers(
    query: string,
    currentUserId: string,
  ): Promise<Result<UserSearchResult[]>> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return { ok: true, value: [] };
    }

    const friendIds = new Set(
      Object.values(this.friendships)
        .filter((f) => f.userId === currentUserId || f.friendUserId === currentUserId)
        .map((f) => (f.userId === currentUserId ? f.friendUserId : f.userId)),
    );
    const pendingFromMe = new Set(
      Object.values(this.invitations)
        .filter((inv) => inv.fromUserId === currentUserId)
        .map((inv) => inv.toUserId),
    );

    const result = mockProfileService
      .getAllProfiles()
      .filter(
        (profile) =>
          profile.userId !== currentUserId &&
          !friendIds.has(profile.userId) &&
          !pendingFromMe.has(profile.userId) &&
          profile.username.toLowerCase().includes(normalized),
      )
      .map((profile) => ({
        userId: profile.userId,
        username: profile.username,
        photoUrl: profile.photoUrl,
      }));

    return { ok: true, value: result };
  }
}

export const mockSocialService = new MockSocialService();
