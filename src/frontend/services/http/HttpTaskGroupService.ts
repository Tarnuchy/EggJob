import type { ITaskGroupService } from '../types/ITaskGroupService';
import type { Result } from '../types/index';
import { API_BASE_URL } from './config';
import { buildAuthHeaders } from './buildAuthHeaders';

const JSON_HEADERS = { Accept: 'application/json' };

export class HttpTaskGroupService implements ITaskGroupService {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

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
    inviteCode?: string;
  }): Promise<Result<void>> {
    void input;
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async editGroup(groupId: string, input: { name?: string; privacy?: string }): Promise<Result<void>> {
    void groupId;
    void input;
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async deleteGroup(groupId: string): Promise<Result<void>> {
    void groupId;
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async inviteFriend(input: {
    invitationId: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    permissions: string;
  }): Promise<Result<void>> {
    void input;
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async cancelInvitation(invitationId: string): Promise<Result<void>> {
    void invitationId;
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async acceptInvitation(input: {
    invitationId: string;
    groupId: string;
    userId: string;
  }): Promise<Result<void>> {
    void input;
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async requestJoin(input: {
    invitationId: string;
    groupId: string;
    inviteCode: string;
    fromUserId: string;
    toUserId: string;
    permissions: string;
  }): Promise<Result<void>> {
    void input;
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async acceptRequest(input: {
    invitationId: string;
    groupId: string;
    userId: string;
    permissions: string;
  }): Promise<Result<void>> {
    void input;
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async rejectRequest(invitationId: string): Promise<Result<void>> {
    void invitationId;
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async addMember(groupId: string, userId: string): Promise<Result<void>> {
    void groupId;
    void userId;
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async removeMember(groupId: string, userId: string): Promise<Result<void>> {
    void groupId;
    void userId;
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async leaveGroup(groupId: string, userId: string): Promise<Result<void>> {
    void groupId;
    void userId;
    return { ok: false, error: { code: 'not-implemented' } };
  }

  async getGroup(groupId: string): Promise<
    Result<{
      name: string;
      privacy: string;
      inviteCode: string;
      memberIds: string[];
      taskIds: string[];
    }>
  > {
    void groupId;
    return { ok: false, error: { code: 'not-implemented' } };
  }
}

export const httpTaskGroupService = new HttpTaskGroupService();
