type Account = {
  email: string;
};

type User = {
  username: string;
  photoUrl?: string;
};

type TaskGroup = {
  name: string;
  ownerUserId: string;
  privacy: string;
  inviteCode: string;
  taskIds: string[];
  memberIds: string[];
};

type Task = {
  name: string;
  goal: number;
  progressId: string;
  params: {
    photoRequired: boolean;
    color: string;
    notifications: boolean;
  };
};

type TaskProgress = {
  value: number;
};

type ProgressEntry = {
  taskId: string;
  value: number;
  commentIds: string[];
};

type Comment = {
  message: string;
};

type Invitation = {
  kind: string;
  fromUserId?: string;
  toUserId?: string;
  groupId?: string;
};

type Friendship = {
  userId: string;
  friendUserId: string;
};

type Notification = {
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
