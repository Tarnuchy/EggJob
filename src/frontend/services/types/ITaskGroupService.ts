import type { Result } from "./index";

export interface ITaskGroupService {
  createGroup(input: {
    groupId: string;
    ownerUserId: string;
    name: string;
    privacy: string;
    inviteCode?: string;
  }): Promise<Result<void>>;

  editGroup(groupId: string, input: { name?: string; privacy?: string }): Promise<Result<void>>;

  deleteGroup(groupId: string): Promise<Result<void>>;

  inviteFriend(input: {
    invitationId: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    permissions: string;
  }): Promise<Result<void>>;

  cancelInvitation(invitationId: string): Promise<Result<void>>;

  acceptInvitation(input: {
    invitationId: string;
    groupId: string;
    userId: string;
  }): Promise<Result<void>>;

  requestJoin(input: {
    invitationId: string;
    groupId: string;
    inviteCode: string;
    fromUserId: string;
    toUserId: string;
    permissions: string;
  }): Promise<Result<void>>;

  acceptRequest(input: {
    invitationId: string;
    groupId: string;
    userId: string;
    permissions: string;
  }): Promise<Result<void>>;

  rejectRequest(invitationId: string): Promise<Result<void>>;

  addMember(groupId: string, userId: string): Promise<Result<void>>;

  removeMember(groupId: string, userId: string): Promise<Result<void>>;

  leaveGroup(groupId: string, userId: string): Promise<Result<void>>;

  getGroup(groupId: string): Promise<
    Result<{
      name: string;
      privacy: string;
      inviteCode: string;
      memberIds: string[];
      taskIds: string[];
    }>
  >;
}