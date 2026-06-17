import type { Result } from './index';
import type { TaskGroupPrivacy, TaskGroupType } from '../../application/state';

/** Lightweight summary of a group a given user belongs to (used on profiles). */
export interface UserGroupSummary {
  id: string;
  name: string;
  privacy: TaskGroupPrivacy;
  type: TaskGroupType;
  isBingo: boolean;
  taskCount: number;
}

export interface ITaskGroupService {
  joinByInviteCode(input: { inviteCode: string; userId: string }): Promise<Result<void>>;

  /** Lists the (active) groups a user belongs to. Callers filter by privacy as needed. */
  listUserGroups(userId: string): Promise<Result<UserGroupSummary[]>>;

  createGroup(input: {
    groupId: string;
    ownerUserId: string;
    name: string;
    privacy: TaskGroupPrivacy;
    isBingo: boolean;
    type: TaskGroupType;
  }): Promise<Result<{ id?: string; inviteCode?: string }>>;

  editGroup(groupId: string, input: { name?: string; privacy?: string; type?: TaskGroupType; isBingo?: boolean }): Promise<Result<void>>;

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

  changeRole(groupId: string, userId: string, role: string): Promise<Result<void>>;

  leaveGroup(groupId: string, userId: string): Promise<Result<void>>;

  getGroup(groupId: string): Promise<
    Result<{
      name: string;
      privacy: string;
      type: string;
      isBingo: boolean;
      inviteCode: string;
      memberIds: string[];
      taskIds: string[];
    }>
  >;
}
