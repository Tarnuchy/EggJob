export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; field?: string } };

export type { IAuthService } from "./IAuthService";
export type { IProfileService } from "./IProfileService";
export type { ISocialService } from "./ISocialService";
export type { ITaskGroupService } from "./ITaskGroupService";
export type { ITaskService, TaskParams } from "./ITaskService";
export type { INotificationService } from "./INotificationService";