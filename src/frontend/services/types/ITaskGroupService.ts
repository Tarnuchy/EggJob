import type { Result } from './index';
import type { BingoSize, TaskGroupPrivacy, TaskGroupType } from '../../application/state';

export interface ITaskGroupService {
  joinByInviteCode(input: { inviteCode: string; userId: string }): Promise<Result<void>>;

  createGroup(input: {
    groupId: string;
    ownerUserId: string;
    name: string;
    privacy: TaskGroupPrivacy;
    isBingo: boolean;
    bingoSize?: BingoSize;
    type: TaskGroupType;
  }): Promise<Result<{ id?: string; inviteCode?: string }>>;

  editGroup(groupId: string, input: { name?: string; privacy?: string; type?: TaskGroupType; isBingo?: boolean; bingoSize?: BingoSize }): Promise<Result<void>>;

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
