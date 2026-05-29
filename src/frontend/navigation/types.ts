export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  UserProfile: { userId: string };
  EditProfile: undefined;
  CreateGroup: undefined;
  CreateTask: { groupId: string };
  JoinGroup: undefined;
  EditGroup: { groupId: string };
  GroupTasks: { groupId: string };
};

export type TabParamList = {
  Home: undefined;
  Tasks: undefined;
  Friends: undefined;
  Profile: undefined;
};
