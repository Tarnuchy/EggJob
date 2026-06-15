export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; field?: string } };

/** A single page of a paginated collection: the page's items plus the collection total. */
export interface Page<T> {
  items: T[];
  total: number;
}

/** Page options accepted by the paginated service methods. */
export interface PageOptions {
  limit?: number;
  offset?: number;
}

export type { IAuthService } from './IAuthService';
export type { IProfileService, UserStats } from './IProfileService';
export type { ISocialService, UserSearchResult, FeedItem, FeedItemType } from './ISocialService';
export type { ITaskGroupService } from './ITaskGroupService';
export type { ITaskService, TaskParams } from './ITaskService';
export type { IUploadService, UploadableImage } from './IUploadService';
export type { INotificationService, NotificationItem } from './INotificationService';
export type { IPushService } from './IPushService';
