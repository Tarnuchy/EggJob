import { services } from './ServiceContainer';

export const authService = services.authService;
export const profileService = services.profileService;
export const socialService = services.socialService;
export const taskGroupService = services.taskGroupService;
export const taskService = services.taskService;
export const notificationService = services.notificationService;

export type {
  IAuthService,
  IProfileService,
  ISocialService,
  ITaskGroupService,
  ITaskService,
  INotificationService,
  NotificationItem,
  UserStats,
  UserSearchResult,
  FeedItem,
  FeedItemType,
  TaskParams,
  Result,
} from './types/index';
