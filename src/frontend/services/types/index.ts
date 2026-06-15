export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; field?: string } };

export type { IAuthService } from './IAuthService';
export type { IProfileService, UserStats } from './IProfileService';
export type { ISocialService, UserSearchResult, FeedItem, FeedItemType } from './ISocialService';
export type { ITaskGroupService } from './ITaskGroupService';
export type { ITaskService, TaskParams } from './ITaskService';
export type { IUploadService, UploadableImage } from './IUploadService';
export type { INotificationService, NotificationItem } from './INotificationService';
