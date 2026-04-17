import type { ISocialService } from "../types/ISocialService";
import type { Result } from "../types/index";

class MockSocialService implements ISocialService {
  private invitations: Record<string, { fromUserId: string; toUserId: string }> =
    {};

  private friendships: Record<string, { userId: string; friendUserId: string }> =
    {
      "fr-seed-1": { userId: "usr-seed-1", friendUserId: "usr-seed-2" },
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
      return { ok: false, error: { code: "not-found" } };
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
    userId: string
  ): Promise<Result<Array<{ friendshipId: string; friendUserId: string }>>> {
    const result = Object.entries(this.friendships)
      .filter(([, friendship]) =>
        friendship.userId === userId || friendship.friendUserId === userId
      )
      .map(([friendshipId, friendship]) => ({
        friendshipId,
        friendUserId:
          friendship.userId === userId
            ? friendship.friendUserId
            : friendship.userId,
      }));

    return { ok: true, value: result };
  }

  async getPendingInvitations(
    userId: string
  ): Promise<Result<Array<{ invitationId: string; fromUserId: string }>>> {
    const result = Object.entries(this.invitations)
      .filter(([, invitation]) => invitation.toUserId === userId)
      .map(([invitationId, invitation]) => ({
        invitationId,
        fromUserId: invitation.fromUserId,
      }));

    return { ok: true, value: result };
  }
}

export const mockSocialService = new MockSocialService();