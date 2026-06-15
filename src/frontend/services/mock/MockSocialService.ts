import type { FeedItem, ISocialService, UserSearchResult } from '../types/ISocialService';
import type { Page, PageOptions, Result } from '../types/index';
import { DEFAULT_PAGE_SIZE } from '../pagination';
import { mockProfileService } from './MockProfileService';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

class MockSocialService implements ISocialService {
  private invitations: Record<string, { fromUserId: string; toUserId: string }> = {
    'inv-seed-1': { fromUserId: 'usr-seed-3', toUserId: 'usr-seed-1' },
    'inv-seed-2': { fromUserId: 'usr-seed-4', toUserId: 'usr-seed-1' },
    'inv-seed-3': { fromUserId: 'usr-seed-1', toUserId: 'usr-seed-6' },
  };

  private friendships: Record<string, { userId: string; friendUserId: string }> = {
    'fr-seed-1': { userId: 'usr-seed-1', friendUserId: 'usr-seed-2' },
    'fr-seed-2': { userId: 'usr-seed-1', friendUserId: 'usr-seed-5' },
  };

  /** Friend activity, keyed by the viewer whose feed it belongs to. */
  private feeds: Record<string, FeedItem[]> = {
    'usr-seed-1': [
      {
        type: 'progress_entry',
        createdAt: new Date(Date.now() - 3 * HOUR).toISOString(),
        userId: 'usr-seed-2',
        username: 'bob',
        taskId: 'tsk-seed-1',
        groupId: 'grp-seed-1',
        message: 'Ran 5 km before work.',
        value: 5,
      },
      {
        type: 'comment',
        createdAt: new Date(Date.now() - 1 * DAY).toISOString(),
        userId: 'usr-seed-5',
        username: 'erin',
        taskId: 'tsk-seed-2',
        groupId: 'grp-seed-1',
        message: 'Great pace, keep it up!',
      },
      {
        type: 'progress_entry',
        createdAt: new Date(Date.now() - 4 * DAY).toISOString(),
        userId: 'usr-seed-5',
        username: 'erin',
        taskId: 'tsk-seed-3',
        groupId: 'grp-seed-2',
        message: 'Finished chapter 3 of the reading challenge.',
        value: 3,
      },
      {
        type: 'progress_entry',
        createdAt: new Date(Date.now() - 6 * DAY).toISOString(),
        userId: 'usr-seed-2',
        username: 'bob',
        taskId: 'tsk-seed-1',
        groupId: 'grp-seed-1',
        message: 'Logged a 30-minute workout.',
        value: 1,
      },
    ],
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

  async cancelInvitation(invitationId: string): Promise<Result<void>> {
    if (!this.invitations[invitationId]) {
      return { ok: false, error: { code: 'not-found' } };
    }
    delete this.invitations[invitationId];
    return { ok: true, value: undefined };
  }

  async removeFriend(friendshipId: string): Promise<Result<void>> {
    delete this.friendships[friendshipId];
    return { ok: true, value: undefined };
  }

  async getFriends(
    userId: string,
    opts?: PageOptions,
  ): Promise<
    Result<
      Page<{ friendshipId: string; friendUserId: string; username: string; photoUrl?: string }>
    >
  > {
    const profiles = new Map(
      mockProfileService.getAllProfiles().map((profile) => [profile.userId, profile]),
    );

    const all = Object.entries(this.friendships)
      .filter(
        ([, friendship]) => friendship.userId === userId || friendship.friendUserId === userId,
      )
      .map(([friendshipId, friendship]) => {
        const friendUserId =
          friendship.userId === userId ? friendship.friendUserId : friendship.userId;
        const profile = profiles.get(friendUserId);
        return {
          friendshipId,
          friendUserId,
          username: profile?.username ?? '',
          photoUrl: profile?.photoUrl,
        };
      })
      // parity with the backend, which orders friends by username asc
      .sort((a, b) => a.username.localeCompare(b.username));

    const offset = opts?.offset ?? 0;
    const limit = opts?.limit ?? DEFAULT_PAGE_SIZE;
    return { ok: true, value: { items: all.slice(offset, offset + limit), total: all.length } };
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

  async getSentInvitations(
    userId: string,
  ): Promise<Result<Array<{ invitationId: string; toUserId: string }>>> {
    const result = Object.entries(this.invitations)
      .filter(([, invitation]) => invitation.fromUserId === userId)
      .map(([invitationId, invitation]) => ({
        invitationId,
        toUserId: invitation.toUserId,
      }));

    return { ok: true, value: result };
  }

  async searchUsers(query: string, currentUserId: string): Promise<Result<UserSearchResult[]>> {
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

  async getUserFeed(userId: string): Promise<Result<FeedItem[]>> {
    const items = [...(this.feeds[userId] ?? [])].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return { ok: true, value: items };
  }
}

export const mockSocialService = new MockSocialService();
export { MockSocialService };
