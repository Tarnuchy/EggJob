import type { ITaskGroupService } from '../types/ITaskGroupService';
import type { Result } from '../types/index';
import { API_BASE_URL } from './config';
import { buildAuthHeaders } from './buildAuthHeaders';
import { CurrentUser } from './CurrentUser';

const JSON_HEADERS = { Accept: 'application/json' };

export class HttpTaskGroupService implements ITaskGroupService {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

  private async resolveGroupMemberId(groupId: string, userId: string): Promise<Result<string>> {
    let response: Response;
    try {
      const headers = await buildAuthHeaders();
      response = await fetch(`${this.baseUrl}/taskgroups/${encodeURIComponent(groupId)}/members`, {
        method: 'GET',
        headers: { ...headers, ...JSON_HEADERS },
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      if (response.status === 401) return { ok: false, error: { code: 'unauthorized' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    try {
      const parsed = await response.json();
      const member = Array.isArray(parsed?.items)
        ? parsed.items.find((item: { user_id?: string }) => item?.user_id === userId)
        : null;
      if (!member?.id) {
        return { ok: false, error: { code: 'not-found' } };
      }
      return { ok: true, value: member.id };
    } catch {
      return { ok: false, error: { code: 'invalid-response' } };
    }
  }

  async joinByInviteCode(input: { inviteCode: string; userId: string }): Promise<Result<void>> {
    let response: Response;
    try {
      const headers = await buildAuthHeaders();
      response = await fetch(
        `${this.baseUrl}/taskgroups/join/${encodeURIComponent(
          input.inviteCode,
        )}?user_id=${encodeURIComponent(input.userId)}`,
        {
          method: 'POST',
          headers: { ...headers, ...JSON_HEADERS },
        },
      );
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 400) return { ok: false, error: { code: 'validation' } };
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      if (response.status === 409) return { ok: false, error: { code: 'conflict' } };
      if (response.status === 401) return { ok: false, error: { code: 'unauthorized' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    return { ok: true, value: undefined };
  }

  async createGroup(input: {
    groupId: string;
    ownerUserId: string;
    name: string;
    privacy: string;
    isBingo: boolean;
    type: 'cooperative' | 'competitive';
  }): Promise<Result<{ id?: string; inviteCode?: string }>> {
    let response: Response;
    try {
      const headers = await buildAuthHeaders();
      const body = JSON.stringify({
        name: input.name,
        privacy: input.privacy,
        is_bingo: input.isBingo,
        type: input.type,
      });
      response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(input.ownerUserId)}/taskgroups`, {
        method: 'POST',
        headers: { ...headers, ...JSON_HEADERS },
        body,
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 400) return { ok: false, error: { code: 'validation' } };
      if (response.status === 401) return { ok: false, error: { code: 'unauthorized' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    try {
      const parsed = await response.json();
      return { ok: true, value: { id: parsed.id, inviteCode: parsed.invite_code ?? parsed.inviteCode } };
    } catch {
      return { ok: true, value: {} };
    }
  }

  async editGroup(groupId: string, input: { name?: string; privacy?: string; type?: 'cooperative' | 'competitive'; isBingo?: boolean }): Promise<Result<void>> {
    let response: Response;
    try {
      const actingUser = CurrentUser.get();
      if (!actingUser) return { ok: false, error: { code: 'unauthorized' } };
      const headers = await buildAuthHeaders();
      const bodyPayload: Record<string, unknown> = {};
      if (input.name !== undefined) bodyPayload.name = input.name;
      if (input.privacy !== undefined) bodyPayload.privacy = input.privacy;
      if (input.isBingo !== undefined) bodyPayload.is_bingo = input.isBingo;

      response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(actingUser)}/taskgroups/${encodeURIComponent(
        groupId,
      )}`, {
        method: 'PATCH',
        headers: { ...headers, ...JSON_HEADERS },
        body: JSON.stringify(bodyPayload),
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 400) return { ok: false, error: { code: 'validation' } };
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      if (response.status === 401) return { ok: false, error: { code: 'unauthorized' } };
      if (response.status === 403) return { ok: false, error: { code: 'forbidden' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    // group type has its own endpoint — the PATCH body ignores `type`
    if (input.type !== undefined) {
      try {
        const actingUser = CurrentUser.get();
        if (!actingUser) return { ok: false, error: { code: 'unauthorized' } };
        const headers = await buildAuthHeaders();
        const typeRes = await fetch(
          `${this.baseUrl}/users/${encodeURIComponent(actingUser)}/taskgroups/${encodeURIComponent(groupId)}/type`,
          {
            method: 'POST',
            headers: { ...headers, ...JSON_HEADERS },
            body: JSON.stringify({ new_type: input.type }),
          },
        );
        if (!typeRes.ok && typeRes.status !== 403) {
          return { ok: false, error: { code: `http-${typeRes.status}` } };
        }
      } catch {
        return { ok: false, error: { code: 'network' } };
      }
    }

    return { ok: true, value: undefined };
  }

  async deleteGroup(groupId: string): Promise<Result<void>> {
    let response: Response;
    try {
      const actingUser = CurrentUser.get();
      if (!actingUser) return { ok: false, error: { code: 'unauthorized' } };
      const headers = await buildAuthHeaders();
      response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(actingUser)}/taskgroups/${encodeURIComponent(
        groupId,
      )}`, {
        method: 'DELETE',
        headers: { ...headers },
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      if (response.status === 401) return { ok: false, error: { code: 'unauthorized' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    return { ok: true, value: undefined };
  }

  async inviteFriend(input: {
    invitationId: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    permissions: string;
  }): Promise<Result<void>> {
    let response: Response;
    try {
      const headers = await buildAuthHeaders();
      response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(
        input.fromUserId,
      )}/taskgroups/${encodeURIComponent(input.groupId)}/members`, {
        method: 'POST',
        headers: { ...headers },
        body: JSON.stringify({ friend_id: input.toUserId, role: input.permissions }),
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 400) return { ok: false, error: { code: 'validation' } };
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      if (response.status === 401) return { ok: false, error: { code: 'unauthorized' } };
      if (response.status === 409) return { ok: false, error: { code: 'conflict' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    return { ok: true, value: undefined };
  }

  async cancelInvitation(_invitationId: string): Promise<Result<void>> {
    // no backend endpoint to cancel by id in this API surface; treat as not-implemented
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async acceptInvitation(input: {
    invitationId: string;
    groupId: string;
    userId: string;
  }): Promise<Result<void>> {
    // map to join by invite code flow if inviteCode known; otherwise addMember
    let response: Response;
    try {
      const headers = await buildAuthHeaders();
      response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(
        input.userId,
      )}/taskgroups/${encodeURIComponent(input.groupId)}/members`, {
        method: 'POST',
        headers: { ...headers },
        body: JSON.stringify({ friend_id: input.userId, role: 'member' }),
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 400) return { ok: false, error: { code: 'validation' } };
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    return { ok: true, value: undefined };
  }

  async requestJoin(input: {
    invitationId: string;
    groupId: string;
    inviteCode: string;
    fromUserId: string;
    toUserId: string;
    permissions: string;
  }): Promise<Result<void>> {
    // create a join request as an invitation in backend is not implemented; fallback to calling joinByInviteCode
    if (!input.inviteCode) return { ok: false, error: { code: 'validation', field: 'inviteCode' } };
    return this.joinByInviteCode({ inviteCode: input.inviteCode, userId: input.toUserId });
  }

  async acceptRequest(input: {
    invitationId: string;
    groupId: string;
    userId: string;
    permissions: string;
  }): Promise<Result<void>> {
    // accept request -> add member
    return this.addMember(input.groupId, input.userId);
  }

  async rejectRequest(_invitationId: string): Promise<Result<void>> {
    // no backend endpoint for rejecting stored invitations in this simplified API
    return { ok: true, value: undefined };
  }

  async addMember(groupId: string, userId: string): Promise<Result<void>> {
    let response: Response;
    try {
      const actingUser = CurrentUser.get();
      if (!actingUser) return { ok: false, error: { code: 'unauthorized' } };
      const headers = await buildAuthHeaders();
      response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(actingUser)}/taskgroups/${encodeURIComponent(
        groupId,
      )}/members`, {
        method: 'POST',
        headers: { ...headers },
        body: JSON.stringify({ friend_id: userId, role: 'member' }),
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 400) return { ok: false, error: { code: 'validation' } };
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      if (response.status === 409) return { ok: false, error: { code: 'conflict' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    return { ok: true, value: undefined };
  }

  async removeMember(groupId: string, userId: string): Promise<Result<void>> {
    let response: Response;
    try {
      const actingUser = CurrentUser.get();
      if (!actingUser) return { ok: false, error: { code: 'unauthorized' } };
      const memberIdResult = await this.resolveGroupMemberId(groupId, userId);
      if (!memberIdResult.ok) return memberIdResult;
      const headers = await buildAuthHeaders();
      // backend expects member id for some operations; here we call remove endpoint by member user via group members remove
      response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(actingUser)}/groupmembers/${encodeURIComponent(
        memberIdResult.value,
      )}/remove`, {
        method: 'POST',
        headers: { ...headers },
        body: JSON.stringify({ take_progress: false }),
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    return { ok: true, value: undefined };
  }

  async changeRole(groupId: string, userId: string, role: string): Promise<Result<void>> {
    if (role === 'owner') {
      return { ok: false, error: { code: 'validation' } };
    }

    let response: Response;
    try {
      const actingUser = CurrentUser.get();
      if (!actingUser) return { ok: false, error: { code: 'unauthorized' } };
      const memberIdResult = await this.resolveGroupMemberId(groupId, userId);
      if (!memberIdResult.ok) return memberIdResult;
      const headers = await buildAuthHeaders();
      response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(actingUser)}/groupmembers/${encodeURIComponent(memberIdResult.value)}/role`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_role: role }),
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      if (response.status === 403) return { ok: false, error: { code: 'forbidden' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    return { ok: true, value: undefined };
  }

  async leaveGroup(groupId: string, userId: string): Promise<Result<void>> {
    // call removeMember on current user
    const actingUser = CurrentUser.get() ?? userId;
    return this.removeMember(groupId, actingUser);
  }

  private async fetchGroupMemberIds(groupId: string): Promise<string[]> {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/taskgroups/${encodeURIComponent(groupId)}/members`,
        { method: 'GET', headers: { ...headers, ...JSON_HEADERS } },
      );
      if (!response.ok) return [];
      const parsed = await response.json();
      const items: Array<{ user_id?: string; role?: string | null; active?: boolean }> =
        Array.isArray(parsed?.items) ? parsed.items : [];
      // mirror hydrateTaskData: skip inactive members and the owner (tracked separately)
      return items
        .filter((m) => m.active !== false && m.role !== 'owner')
        .map((m) => m.user_id)
        .filter((id): id is string => typeof id === 'string');
    } catch {
      return [];
    }
  }

  private async fetchGroupTaskIds(groupId: string): Promise<string[]> {
    try {
      const headers = await buildAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/taskgroups/${encodeURIComponent(groupId)}/tasks`,
        { method: 'GET', headers: { ...headers, ...JSON_HEADERS } },
      );
      if (!response.ok) return [];
      const parsed = await response.json();
      const items: Array<{ id?: string }> = Array.isArray(parsed?.items) ? parsed.items : [];
      return items.map((t) => t.id).filter((id): id is string => typeof id === 'string');
    } catch {
      return [];
    }
  }

  async getGroup(groupId: string): Promise<
    Result<{
      name: string;
      privacy: string;
      type: string;
      isBingo: boolean;
      inviteCode: string;
      memberIds: string[];
      taskIds: string[];
    }>
  > {
    let response: Response;
    try {
      const headers = await buildAuthHeaders();
      response = await fetch(`${this.baseUrl}/taskgroups/${encodeURIComponent(groupId)}`, {
        method: 'GET',
        headers: { ...headers },
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    try {
      const parsed = await response.json();
      const [memberIds, taskIds] = await Promise.all([
        this.fetchGroupMemberIds(groupId),
        this.fetchGroupTaskIds(groupId),
      ]);
      return {
        ok: true,
        value: {
          name: parsed.name,
          privacy: parsed.privacy,
          type: parsed.type ?? 'cooperative',
          isBingo: Boolean(parsed.is_bingo ?? parsed.isBingo),
          inviteCode: parsed.invite_code ?? parsed.inviteCode ?? '',
          memberIds,
          taskIds,
        },
      };
    } catch {
      return { ok: false, error: { code: 'invalid-response' } };
    }
  }
}

export const httpTaskGroupService = new HttpTaskGroupService();
