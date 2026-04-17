export { mockAuthService as authService } from "./mock/MockAuthService";
export { mockProfileService as profileService } from "./mock/MockProfileService";
export { mockSocialService as socialService } from "./mock/MockSocialService";
export { mockTaskGroupService as taskGroupService } from "./mock/MockTaskGroupService";
export { mockTaskService as taskService } from "./mock/MockTaskService";
export { mockNotificationService as notificationService } from "./mock/MockNotificationService";

export type {
  IAuthService,
  IProfileService,
  ISocialService,
  ITaskGroupService,
  ITaskService,
  INotificationService,
  TaskParams,
  Result,
} from "./types/index";