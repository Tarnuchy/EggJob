import type { Result } from "./index";

export type TaskParams = {
  photoRequired: boolean;
  color: string;
  notifications: boolean;
};

export interface ITaskService {
  createTask(input: {
    taskId: string;
    groupId: string;
    progressId: string;
    name: string;
    goal: number;
    status: string;
    kind: string;
    params: TaskParams;
  }): Promise<Result<void>>;

  editTask(
    taskId: string,
    input: { name?: string; goal?: number; status?: string; params?: Partial<TaskParams> }
  ): Promise<Result<void>>;

  deleteTask(taskId: string): Promise<Result<void>>;

  addProgress(input: {
    entryId: string;
    taskId: string;
    authorUserId: string;
    value: number;
    note: string;
  }): Promise<Result<void>>;

  addComment(input: {
    commentId: string;
    progressEntryId: string;
    authorUserId: string;
    message: string;
  }): Promise<Result<void>>;

  deleteComment(input: {
    commentId: string;
    progressEntryId: string;
  }): Promise<Result<void>>;

  getTask(taskId: string): Promise<
    Result<{
      name: string;
      goal: number;
      progressId: string;
      params: TaskParams;
    }>
  >;

  getProgressEntries(taskId: string): Promise<
    Result<
      Array<{
        entryId: string;
        value: number;
        commentIds: string[];
      }>
    >
  >;
}