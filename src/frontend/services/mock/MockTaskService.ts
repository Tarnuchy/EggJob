import type { ITaskService, TaskParams } from '../types/ITaskService';
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

  private entries: Record<string, { taskId: string; value: number; commentIds: string[] }> = {};
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
    input: { name?: string; goal?: number; status?: string; params?: Partial<TaskParams> },
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
  }): Promise<Result<void>> {
    const { entryId, taskId, value } = input;
    if (value < 0) {
      return { ok: false, error: { code: 'validation', field: 'value' } };
    }

    // W trybie mock źródłem prawdy jest reducer — brak taska w lokalnym store nie jest błędem.
    const task = this.tasks[taskId];
    if (task) {
      this.entries[entryId] = { taskId, value, commentIds: [] };
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

  async getTask(
    taskId: string,
  ): Promise<Result<{ name: string; goal: number; progressId: string; params: TaskParams }>> {
    const task = this.tasks[taskId];
    if (!task) {
      return { ok: false, error: { code: 'not-found' } };
    }

    return { ok: true, value: { ...task } };
  }

  async getProgressEntries(
    taskId: string,
  ): Promise<Result<Array<{ entryId: string; value: number; commentIds: string[] }>>> {
    const result = Object.entries(this.entries)
      .filter(([, entry]) => entry.taskId === taskId)
      .map(([entryId, entry]) => ({
        entryId,
        value: entry.value,
        commentIds: [...entry.commentIds],
      }));

    return { ok: true, value: result };
  }
}

export const mockTaskService = new MockTaskService();
