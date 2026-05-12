export type TaskColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export type TaskGroupPrivacy = 'public' | 'private' | 'friends';

export type InvitationKind = 'friend' | 'task-group' | 'task-group-request';

export type Account = {
  email: string;
};

export type User = {
  username: string;
  photoUrl?: string;
};

export type TaskGroup = {
  name: string;
  ownerUserId: string;
  privacy: TaskGroupPrivacy;
  inviteCode: string;
  taskIds: string[];
  memberIds: string[];
};

export type TaskParams = {
  photoRequired: boolean;
  color: TaskColor;
  notifications: boolean;
};

export type Task = {
  name: string;
  goal: number;
  progressId: string;
  params: TaskParams;
};

export type TaskProgress = {
  value: number;
};

export type ProgressEntry = {
  taskId: string;
  value: number;
  commentIds: string[];
};

export type Comment = {
  message: string;
};

export type Invitation = {
  kind: InvitationKind;
  fromUserId?: string;
  toUserId?: string;
  groupId?: string;
};

export type Friendship = {
  userId: string;
  friendUserId: string;
};

export type Notification = {
  active: boolean;
};

export type FrontendState = {
  session: { currentAccountId: string | null; currentUserId: string | null };
  entities: {
    accounts: Record<string, Account>;
    users: Record<string, User>;
    taskGroups: Record<string, TaskGroup>;
    tasks: Record<string, Task>;
    taskProgresses: Record<string, TaskProgress>;
    progressEntries: Record<string, ProgressEntry>;
    comments: Record<string, Comment>;
    invitations: Record<string, Invitation>;
    friendships: Record<string, Friendship>;
    notifications: Record<string, Notification>;
  };
};

export function createInitialFrontendState(): FrontendState {
  return {
    session: { currentAccountId: null, currentUserId: null },
    entities: {
      accounts: {},
      users: {},
      taskGroups: {},
      tasks: {},
      taskProgresses: {},
      progressEntries: {},
      comments: {},
      invitations: {},
      friendships: {},
      notifications: {},
    },
  };
}
