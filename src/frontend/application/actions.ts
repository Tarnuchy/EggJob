import type { TaskGroupPrivacy, TaskGroupType, TaskParams, MemberRole } from './state';

export type AppAction =
  | {
      type: 'auth/register';
      accountId: string;
      userId: string;
      email: string;
      username: string;
      passwordHash?: string;
      registrationDate?: Date;
    }
  | {
      type: 'auth/login';
      accountId: string;
      userId: string;
    }
  | {
      type: 'auth/logout';
    }
  | {
      type: 'profile/edit';
      userId: string;
      username?: string;
      photoUrl?: string;
    }
  | {
      type: 'account/delete';
      accountId: string;
      userId: string;
    }
  | {
      type: 'friends/invite';
      invitationId: string;
      fromUserId: string;
      toUserId: string;
    }
  | {
      type: 'friends/accept-invite';
      invitationId: string;
      friendshipId: string;
    }
  | {
      type: 'friends/reject-invite';
      invitationId: string;
    }
  | {
      type: 'friends/remove';
      friendshipId: string;
    }
  | {
      type: 'task-groups/create';
      groupId: string;
      ownerUserId: string;
      name: string;
      privacy: TaskGroupPrivacy;
      groupType: TaskGroupType;
      isBingo: boolean;
      inviteCode?: string;
      createdAt?: Date;
    }
  | {
      type: 'task-groups/edit';
      groupId: string;
      name?: string;
      privacy?: TaskGroupPrivacy;
    }
  | {
      type: 'task-groups/delete';
      groupId: string;
    }
  | {
      type: 'task-groups/add-member';
      groupId: string;
      userId: string;
    }
  | {
      type: 'task-groups/remove-member';
      groupId: string;
      userId: string;
    }
  | {
      type: 'task-groups/change-role';
      groupId: string;
      userId: string;
      role: MemberRole;
    }
  | {
      type: 'task-groups/leave';
      groupId: string;
      userId: string;
    }
  | {
      type: 'task-groups/invite-friend';
      invitationId: string;
      groupId: string;
      fromUserId: string;
      toUserId: string;
      permissions?: string;
    }
  | {
      type: 'task-groups/cancel-invitation';
      invitationId: string;
    }
  | {
      type: 'task-groups/accept-invitation';
      invitationId: string;
      groupId: string;
      userId: string;
    }
  | {
      type: 'task-groups/request-join';
      invitationId: string;
      groupId: string;
      inviteCode: string;
      fromUserId: string;
      toUserId: string;
      permissions?: string;
    }
  | {
      type: 'task-groups/accept-request';
      invitationId: string;
      groupId: string;
      userId: string;
    }
  | {
      type: 'task-groups/reject-request';
      invitationId: string;
    }
  | {
      type: 'tasks/create';
      taskId: string;
      groupId: string;
      progressId: string;
      name: string;
      goal: number;
      params: TaskParams;
      description?: string;
      status?: string;
      kind?: string;
      createdAt?: Date;
    }
  | {
      type: 'tasks/edit';
      taskId: string;
      name?: string;
      goal?: number;
      params?: Partial<TaskParams>;
      description?: string;
      status?: string;
      createdAt?: Date;
    }
  | {
      type: 'tasks/delete';
      taskId: string;
    }
  | {
      type: 'tasks/add-progress';
      entryId: string;
      taskId: string;
      authorUserId: string;
      value: number;
      note?: string;
      createdAt?: Date;
    }
  | {
      type: 'tasks/add-comment';
      commentId: string;
      progressEntryId: string;
      message: string;
      authorUserId?: string;
      date?: Date;
    }
  | {
      type: 'tasks/delete-comment';
      commentId: string;
      progressEntryId: string;
    }
  | {
      type: 'notifications/add';
      notificationId: string;
    }
  | {
      type: 'notifications/read';
      notificationId: string;
    };

export type AppActionType = AppAction['type'];

export type ActionOf<T extends AppActionType> = Extract<AppAction, { type: T }>;
