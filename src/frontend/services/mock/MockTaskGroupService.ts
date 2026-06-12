import type { ITaskGroupService } from '../types/ITaskGroupService';
import type { Result } from '../types/index';

class MockTaskGroupService implements ITaskGroupService {
  private groups: Record<
    string,
    {
      name: string;
      privacy: string;
      type: 'cooperative' | 'competitive';
      isBingo: boolean;
      inviteCode: string;
      ownerUserId: string;
      memberIds: string[];
      memberRoles: Record<string, string>;
      taskIds: string[];
    }
  > = {
    'grp-seed-1': {
      name: 'Morning Run Club',
      privacy: 'private',
      type: 'cooperative',
      isBingo: false,
      inviteCode: 'MORN01',
      ownerUserId: 'usr-seed-1',
      memberIds: ['usr-seed-1'],
      memberRoles: { 'usr-seed-1': 'owner' },
      taskIds: ['tsk-seed-1', 'tsk-seed-2'],
    },
  };

  private invitations: Record<string, { groupId: string; fromUserId: string; toUserId: string }> =
    {};

  async joinByInviteCode(input: { inviteCode: string; userId: string }): Promise<Result<void>> {
    const group = Object.values(this.groups).find(
      (item) => item.inviteCode.toUpperCase() === input.inviteCode.toUpperCase(),
    );
    if (!group) {
      return { ok: false, error: { code: 'not-found' } };
    }
    if (!group.memberIds.includes(input.userId)) {
      group.memberIds.push(input.userId);
      group.memberRoles[input.userId] = 'member';
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
    if (!input.name || input.name.trim().length === 0) {
      return { ok: false, error: { code: 'validation', field: 'name' } };
    }
    const existingCodes = new Set(Object.values(this.groups).map((g) => g.inviteCode.toUpperCase()));
    let code: string;
    // generate until unique (extremely unlikely to loop more than once)
    do {
      code = `MOCK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    } while (existingCodes.has(code));

    this.groups[input.groupId] = {
      name: input.name.trim(),
      privacy: input.privacy,
      type: input.type,
      isBingo: input.isBingo,
      inviteCode: code,
      ownerUserId: input.ownerUserId,
      memberIds: [],
      memberRoles: { [input.ownerUserId]: 'owner' },
      taskIds: [],
    };

    return { ok: true, value: { id: input.groupId, inviteCode: code } };
  }

  async editGroup(
    groupId: string,
    input: { name?: string; privacy?: string; type?: 'cooperative' | 'competitive'; isBingo?: boolean },
  ): Promise<Result<void>> {
    const group = this.groups[groupId];
    if (!group) {
      return { ok: false, error: { code: 'not-found' } };
    }

    if (input.name !== undefined) {
      group.name = input.name;
    }
    if (input.privacy !== undefined) {
      group.privacy = input.privacy;
    }
    if (input.type !== undefined) {
      group.type = input.type;
    }
    if (input.isBingo !== undefined) {
      group.isBingo = input.isBingo;
    }

    return { ok: true, value: undefined };
  }

  async deleteGroup(groupId: string): Promise<Result<void>> {
    delete this.groups[groupId];
    return { ok: true, value: undefined };
  }

  async inviteFriend(input: {
    invitationId: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    permissions: string;
  }): Promise<Result<void>> {
    void input.permissions;
    this.invitations[input.invitationId] = {
      groupId: input.groupId,
      fromUserId: input.fromUserId,
      toUserId: input.toUserId,
    };
    return { ok: true, value: undefined };
  }

  async cancelInvitation(invitationId: string): Promise<Result<void>> {
    delete this.invitations[invitationId];
    return { ok: true, value: undefined };
  }

  async acceptInvitation(input: {
    invitationId: string;
    groupId: string;
    userId: string;
  }): Promise<Result<void>> {
    delete this.invitations[input.invitationId];

    const group = this.groups[input.groupId];
    if (group && !group.memberIds.includes(input.userId)) {
      group.memberIds.push(input.userId);
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
    void input.permissions;
    const group = this.groups[input.groupId];
    if (!group) {
      return { ok: false, error: { code: 'not-found' } };
    }
    if (group.inviteCode && input.inviteCode !== group.inviteCode) {
      return { ok: false, error: { code: 'validation', field: 'inviteCode' } };
    }

    this.invitations[input.invitationId] = {
      groupId: input.groupId,
      fromUserId: input.fromUserId,
      toUserId: input.toUserId,
    };
    return { ok: true, value: undefined };
  }

  async acceptRequest(input: {
    invitationId: string;
    groupId: string;
    userId: string;
    permissions: string;
  }): Promise<Result<void>> {
    void input.permissions;
    delete this.invitations[input.invitationId];

    const group = this.groups[input.groupId];
    if (group && !group.memberIds.includes(input.userId)) {
      group.memberIds.push(input.userId);
    }

    return { ok: true, value: undefined };
  }

  async rejectRequest(invitationId: string): Promise<Result<void>> {
    delete this.invitations[invitationId];
    return { ok: true, value: undefined };
  }

  async addMember(groupId: string, userId: string): Promise<Result<void>> {
    const group = this.groups[groupId];
    if (!group) {
      return { ok: false, error: { code: 'not-found' } };
    }

    if (group.ownerUserId === userId) {
      return { ok: true, value: undefined };
    }

    if (!group.memberIds.includes(userId)) {
      group.memberIds.push(userId);
      group.memberRoles[userId] = 'member';
    }

    return { ok: true, value: undefined };
  }

  async removeMember(groupId: string, userId: string): Promise<Result<void>> {
    const group = this.groups[groupId];
    if (group) {
      if (group.ownerUserId === userId) {
        return { ok: false, error: { code: 'validation', field: 'role' } };
      }

      group.memberIds = group.memberIds.filter((id) => id !== userId);
      delete group.memberRoles[userId];
    }
    return { ok: true, value: undefined };
  }

  async changeRole(groupId: string, userId: string, role: string): Promise<Result<void>> {
    const group = this.groups[groupId];
    if (!group) {
      return { ok: false, error: { code: 'not-found' } };
    }

    if (role === 'owner' || group.ownerUserId === userId) {
      return { ok: false, error: { code: 'validation', field: 'role' } };
    }

    if (!group.memberIds.includes(userId)) {
      return { ok: false, error: { code: 'not-found' } };
    }

    group.memberRoles[userId] = role;
    return { ok: true, value: undefined };
  }

  async leaveGroup(groupId: string, userId: string): Promise<Result<void>> {
    return this.removeMember(groupId, userId);
  }

  async getGroup(groupId: string): Promise<
    Result<{
      name: string;
      privacy: string;
      type: 'cooperative' | 'competitive';
      isBingo: boolean;
      inviteCode: string;
      memberIds: string[];
      memberRoles: Record<string, string>;
      taskIds: string[];
    }>
  > {
    const group = this.groups[groupId];
    if (!group) {
      return { ok: false, error: { code: 'not-found' } };
    }

    return {
      ok: true,
      value: {
        name: group.name,
        privacy: group.privacy,
        type: group.type,
        isBingo: group.isBingo,
        inviteCode: group.inviteCode,
        memberIds: [...group.memberIds],
        memberRoles: { ...group.memberRoles },
        taskIds: [...group.taskIds],
      },
    };
  }
}

export const mockTaskGroupService = new MockTaskGroupService();
