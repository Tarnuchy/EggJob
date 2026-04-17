import type { ITaskGroupService } from "../types/ITaskGroupService";
import type { Result } from "../types/index";

class MockTaskGroupService implements ITaskGroupService {
  private groups: Record<
    string,
    {
      name: string;
      privacy: string;
      inviteCode: string;
      ownerUserId: string;
      memberIds: string[];
      taskIds: string[];
    }
  > = {
    "grp-seed-1": {
      name: "Morning Run Club",
      privacy: "friends",
      inviteCode: "MORN01",
      ownerUserId: "usr-seed-1",
      memberIds: ["usr-seed-1"],
      taskIds: ["tsk-seed-1", "tsk-seed-2"],
    },
  };

  private invitations: Record<
    string,
    { groupId: string; fromUserId: string; toUserId: string }
  > = {};

  async createGroup(input: {
    groupId: string;
    ownerUserId: string;
    name: string;
    privacy: string;
    inviteCode?: string;
  }): Promise<Result<void>> {
    if (!input.name || input.name.trim().length === 0) {
      return { ok: false, error: { code: "validation", field: "name" } };
    }

    this.groups[input.groupId] = {
      name: input.name.trim(),
      privacy: input.privacy,
      inviteCode: input.inviteCode ?? "",
      ownerUserId: input.ownerUserId,
      memberIds: [],
      taskIds: [],
    };

    return { ok: true, value: undefined };
  }

  async editGroup(
    groupId: string,
    input: { name?: string; privacy?: string }
  ): Promise<Result<void>> {
    const group = this.groups[groupId];
    if (!group) {
      return { ok: false, error: { code: "not-found" } };
    }

    if (input.name !== undefined) {
      group.name = input.name;
    }
    if (input.privacy !== undefined) {
      group.privacy = input.privacy;
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
      return { ok: false, error: { code: "not-found" } };
    }
    if (group.inviteCode && input.inviteCode !== group.inviteCode) {
      return { ok: false, error: { code: "validation", field: "inviteCode" } };
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
      return { ok: false, error: { code: "not-found" } };
    }

    if (!group.memberIds.includes(userId)) {
      group.memberIds.push(userId);
    }

    return { ok: true, value: undefined };
  }

  async removeMember(groupId: string, userId: string): Promise<Result<void>> {
    const group = this.groups[groupId];
    if (group) {
      group.memberIds = group.memberIds.filter((id) => id !== userId);
    }
    return { ok: true, value: undefined };
  }

  async leaveGroup(groupId: string, userId: string): Promise<Result<void>> {
    return this.removeMember(groupId, userId);
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
    const group = this.groups[groupId];
    if (!group) {
      return { ok: false, error: { code: "not-found" } };
    }

    return {
      ok: true,
      value: {
        name: group.name,
        privacy: group.privacy,
        inviteCode: group.inviteCode,
        memberIds: [...group.memberIds],
        taskIds: [...group.taskIds],
      },
    };
  }
}

export const mockTaskGroupService = new MockTaskGroupService();