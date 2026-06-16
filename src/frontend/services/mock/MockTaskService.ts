import type { ITaskService, TaskParams } from '../types/ITaskService';
import type { TaskKind } from '../../application/state';
import type { Result } from '../types/index';

class MockTaskService implements ITaskService {
  private tasks: Record<
    string,
    { name: string; goal: number; progressId: string; params: TaskParams }
  > = {
    'tsk-seed-1': {
      name: 'Run 5km',
      goal: 5,
      progressId: 'prg-seed-1',
      params: { photoRequired: false, color: '#2563EB', notifications: true },
    },
    'tsk-seed-2': {
      name: 'Push-ups 100',
      goal: 100,
      progressId: 'prg-seed-2',
      params: { photoRequired: false, color: '#16A34A', notifications: false },
    },
  };

  private progresses: Record<string, { value: number }> = {
    'prg-seed-1': { value: 3 },
    'prg-seed-2': { value: 0 },
  };

  private entries: Record<
    string,
    { taskId: string; value: number; message: string; photoUrl?: string; createdAt: string; commentIds: string[] }
  > = {};
  private comments: Record<string, { message: string }> = {};

  async createTask(input: {
    taskId: string;
    groupId: string;
    progressId: string;
    name: string;
    goal: number;
    status: string;
    kind: string;
    params: TaskParams;
  }): Promise<Result<{ id?: string }>> {
    const { taskId, progressId, name, goal, params } = input;
    this.tasks[taskId] = { name, goal, progressId, params };
    this.progresses[progressId] = { value: 0 };
    return { ok: true, value: { id: taskId } };
  }

  async editTask(
    taskId: string,
    input: { name?: string; goal?: number; status?: string; kind?: TaskKind; params?: Partial<TaskParams> },
  ): Promise<Result<void>> {
    const { name, goal, params } = input;
    const task = this.tasks[taskId];
    // W trybie mock źródłem prawdy jest reducer — brak wpisu w lokalnym store nie jest błędem.
    if (task) {
      if (name !== undefined) task.name = name;
      if (goal !== undefined) task.goal = goal;
      if (params) task.params = { ...task.params, ...params };
    }

    return { ok: true, value: undefined };
  }

  async deleteTask(taskId: string): Promise<Result<void>> {
    delete this.tasks[taskId];
    return { ok: true, value: undefined };
  }

  async addProgress(input: {
    entryId: string;
    taskId: string;
    authorUserId: string;
    value: number;
    note: string;
    photoUrl?: string;
  }): Promise<Result<void>> {
    const { entryId, taskId, value, note, photoUrl } = input;
    if (value < 0) {
      return { ok: false, error: { code: 'validation', field: 'value' } };
    }

    // Record the entry unconditionally so the progress timeline can read it back (the reducer
    // remains authoritative for aggregate progress). Missing task in the local store is not an error.
    this.entries[entryId] = {
      taskId,
      value,
      message: note,
      ...(photoUrl !== undefined ? { photoUrl } : {}),
      createdAt: new Date().toISOString(),
      commentIds: [],
    };
    const task = this.tasks[taskId];
    if (task) {
      const progress = this.progresses[task.progressId];
      if (progress) {
        progress.value += value;
      }
    }

    return { ok: true, value: undefined };
  }

  async setProgress(input: {
    taskId: string;
    authorUserId: string;
    value: number;
  }): Promise<Result<void>> {
    const { taskId, value } = input;
    if (value < 0) {
      return { ok: false, error: { code: 'validation', field: 'value' } };
    }

    // W trybie mock źródłem prawdy jest reducer — brak taska w lokalnym store nie jest błędem.
    const task = this.tasks[taskId];
    if (task) {
      this.progresses[task.progressId] = { value };
    }

    return { ok: true, value: undefined };
  }

  async addComment(input: {
    commentId: string;
    progressEntryId: string;
    authorUserId: string;
    message: string;
  }): Promise<Result<void>> {
    const { commentId, progressEntryId, message } = input;
    this.comments[commentId] = { message };
    const entry = this.entries[progressEntryId];
    if (entry) {
      entry.commentIds.push(commentId);
    }
    return { ok: true, value: undefined };
  }

  async deleteComment(input: {
    commentId: string;
    progressEntryId: string;
  }): Promise<Result<void>> {
    delete this.comments[input.commentId];
    const entry = this.entries[input.progressEntryId];
    if (entry) {
      entry.commentIds = entry.commentIds.filter((id) => id !== input.commentId);
    }
    return { ok: true, value: undefined };
  }

  async deleteProgressEntry(input: { entryId: string; authorUserId: string }): Promise<Result<void>> {
    const entry = this.entries[input.entryId];
    if (entry) {
      delete this.entries[input.entryId];
      const task = this.tasks[entry.taskId];
      if (task) {
        const progress = this.progresses[task.progressId];
        if (progress) {
          progress.value = Math.max(0, progress.value - entry.value);
        }
      }
    }
    return { ok: true, value: undefined };
  }

  async getTask(
    taskId: string,
  ): Promise<Result<{ name: string; goal: number; progressId: string; params: TaskParams }>> {
    const task = this.tasks[taskId];
    if (!task) {
      return { ok: false, error: { code: 'not-found' } };
    }

    return { ok: true, value: { ...task } };
  }

  async getProgressEntries(taskId: string): Promise<
    Result<
      Array<{
        entryId: string;
        value: number;
        message: string;
        photoUrl?: string;
        createdAt: string;
        commentIds: string[];
      }>
    >
  > {
    const result = Object.entries(this.entries)
      .filter(([, entry]) => entry.taskId === taskId)
      .map(([entryId, entry]) => ({
        entryId,
        value: entry.value,
        message: entry.message,
        ...(entry.photoUrl !== undefined ? { photoUrl: entry.photoUrl } : {}),
        createdAt: entry.createdAt,
        commentIds: [...entry.commentIds],
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return { ok: true, value: result };
  }
}

export const mockTaskService = new MockTaskService();
