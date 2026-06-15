import type { FeedItem, ISocialService, UserSearchResult } from '../types/ISocialService';
import type { Page, PageOptions, Result } from '../types/index';
import { pageQueryString } from '../pagination';
import { API_BASE_URL } from './config';
import { buildAuthHeaders } from './buildAuthHeaders';
import { CurrentUser } from './CurrentUser';

// Backend identyfikuje zaproszenia parą (from, to), a przyjaźnie parą userów —
// composite id "<a>:<b>" pozwala zachować interfejs oparty na pojedynczym id.
const COMPOSITE_SEPARATOR = ':';

function encodePair(a: string, b: string): string {
  return `${a}${COMPOSITE_SEPARATOR}${b}`;
}

function decodePair(id: string): [string, string] | null {
  const parts = id.split(COMPOSITE_SEPARATOR);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]];
}

type UserSummaryPayload = { id: string; username: string; photo_url?: string | null };
type InvitationPayload = { from_user_id: string; to_user_id: string };
type FeedItemPayload = {
  type: string;
  created_at: string;
  user_id: string;
  username: string;
  task_id?: string | null;
  group_id?: string | null;
  message?: string | null;
  value?: number | null;
};

function mapStatus(status: number): Result<never> {
  if (status === 400) return { ok: false, error: { code: 'validation' } };
  if (status === 401) return { ok: false, error: { code: 'unauthorized' } };
  if (status === 404) return { ok: false, error: { code: 'not-found' } };
  if (status === 409) return { ok: false, error: { code: 'conflict' } };
  return { ok: false, error: { code: `http-${status}` } };
}

export class HttpSocialService implements ISocialService {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

  private async post(path: string, body?: unknown): Promise<Result<void>> {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      if (!response.ok) return mapStatus(response.status);
      return { ok: true, value: undefined };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  private async getJson<T>(path: string): Promise<Result<T>> {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(`${this.baseUrl}${path}`, { method: 'GET', headers });
      if (!response.ok) return mapStatus(response.status);
      return { ok: true, value: (await response.json()) as T };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async inviteFriend(input: {
    invitationId: string;
    fromUserId: string;
    toUserId: string;
  }): Promise<Result<void>> {
    return this.post(`/users/${encodeURIComponent(input.fromUserId)}/friends/invitations`, {
      friend_id: input.toUserId,
    });
  }

  async acceptFriendInvite(input: {
    invitationId: string;
    friendshipId: string;
  }): Promise<Result<void>> {
    const pair = decodePair(input.invitationId);
    if (!pair) return { ok: false, error: { code: 'validation', field: 'invitationId' } };
    return this.post(
      `/invitations/${encodeURIComponent(pair[0])}/${encodeURIComponent(pair[1])}/accept`,
    );
  }

  async rejectFriendInvite(invitationId: string): Promise<Result<void>> {
    const pair = decodePair(invitationId);
    if (!pair) return { ok: false, error: { code: 'validation', field: 'invitationId' } };
    return this.post(
      `/invitations/${encodeURIComponent(pair[0])}/${encodeURIComponent(pair[1])}/reject`,
    );
  }

  async cancelInvitation(invitationId: string): Promise<Result<void>> {
    const pair = decodePair(invitationId);
    if (!pair) return { ok: false, error: { code: 'validation', field: 'invitationId' } };
    return this.post(
      `/invitations/${encodeURIComponent(pair[0])}/${encodeURIComponent(pair[1])}/cancel`,
    );
  }

  async removeFriend(friendshipId: string): Promise<Result<void>> {
    const pair = decodePair(friendshipId);
    if (!pair) return { ok: false, error: { code: 'validation', field: 'friendshipId' } };
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/friendships/${encodeURIComponent(pair[0])}/${encodeURIComponent(pair[1])}`,
        { method: 'DELETE', headers },
      );
      if (!response.ok) return mapStatus(response.status);
      return { ok: true, value: undefined };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async getFriends(
    userId: string,
    opts?: PageOptions,
  ): Promise<
    Result<
      Page<{ friendshipId: string; friendUserId: string; username: string; photoUrl?: string }>
    >
  > {
    const result = await this.getJson<{ items?: UserSummaryPayload[]; total?: number }>(
      `/users/${encodeURIComponent(userId)}/friends${pageQueryString(opts)}`,
    );
    if (!result.ok) return result;
    const items = (result.value.items ?? []).map((friend) => ({
      friendshipId: encodePair(userId, friend.id),
      friendUserId: friend.id,
      username: friend.username,
      photoUrl: friend.photo_url ?? undefined,
    }));
    return { ok: true, value: { items, total: result.value.total ?? items.length } };
  }

  async getPendingInvitations(
    userId: string,
  ): Promise<Result<Array<{ invitationId: string; fromUserId: string }>>> {
    const result = await this.getJson<{ items?: InvitationPayload[] }>(
      `/users/${encodeURIComponent(userId)}/invitations/received`,
    );
    if (!result.ok) return result;
    const items = (result.value.items ?? []).map((invitation) => ({
      invitationId: encodePair(invitation.from_user_id, invitation.to_user_id),
      fromUserId: invitation.from_user_id,
    }));
    return { ok: true, value: items };
  }

  async getSentInvitations(
    userId: string,
  ): Promise<Result<Array<{ invitationId: string; toUserId: string }>>> {
    const result = await this.getJson<{ items?: InvitationPayload[] }>(
      `/users/${encodeURIComponent(userId)}/invitations/sent`,
    );
    if (!result.ok) return result;
    const items = (result.value.items ?? []).map((invitation) => ({
      invitationId: encodePair(invitation.from_user_id, invitation.to_user_id),
      toUserId: invitation.to_user_id,
    }));
    return { ok: true, value: items };
  }

  async searchUsers(query: string, currentUserId: string): Promise<Result<UserSearchResult[]>> {
    const excludeId = currentUserId || CurrentUser.get() || '';
    const params = `q=${encodeURIComponent(query)}${
      excludeId ? `&exclude_user_id=${encodeURIComponent(excludeId)}` : ''
    }`;
    const result = await this.getJson<{ items?: UserSummaryPayload[] }>(`/users/search?${params}`);
    if (!result.ok) return result;
    const items = (result.value.items ?? []).map((user) => ({
      userId: user.id,
      username: user.username,
      photoUrl: user.photo_url ?? undefined,
    }));
    return { ok: true, value: items };
  }

  async getUserFeed(userId: string): Promise<Result<FeedItem[]>> {
    const result = await this.getJson<{ items?: FeedItemPayload[] }>(
      `/users/${encodeURIComponent(userId)}/feed`,
    );
    if (!result.ok) return result;
    const items: FeedItem[] = (result.value.items ?? []).map((item) => ({
      type: item.type === 'comment' ? 'comment' : 'progress_entry',
      createdAt: item.created_at,
      userId: item.user_id,
      username: item.username,
      taskId: item.task_id ?? undefined,
      groupId: item.group_id ?? undefined,
      message: item.message ?? '',
      value: item.value ?? undefined,
    }));
    return { ok: true, value: items };
  }
}

export const httpSocialService = new HttpSocialService();
