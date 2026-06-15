export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  UserProfile: { userId: string };
  EditProfile: undefined;
  CreateGroup: undefined;
  CreateTask: { groupId?: string } | undefined;
  EditTask: { groupId: string; taskId: string };
  AddProgress: { groupId?: string; taskId?: string } | undefined;
  JoinGroup: undefined;
  EditGroup: { groupId: string };
  GroupTasks: { groupId: string };
  TaskDetail: { groupId: string; taskId: string };
};

export type TabParamList = {
  Home: undefined;
  Tasks: undefined;
  Friends: undefined;
  Profile: undefined;
};
