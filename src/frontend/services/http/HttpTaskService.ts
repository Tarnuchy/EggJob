import type { ITaskService, TaskParams } from '../types/ITaskService';
import type { Result } from '../types/index';
import { API_BASE_URL } from './config';
import { buildAuthHeaders } from './buildAuthHeaders';
import { CurrentUser } from './CurrentUser';

const JSON_HEADERS = { Accept: 'application/json', 'Content-Type': 'application/json' };

function mapTaskType(kind: string | undefined): string {
  if (!kind) return 'endless';
  const k = kind.toLowerCase();
  if (k === 'one_time' || k === 'onetime') return 'one_time';
  if (k === 'repeatable') return 'repeatable';
  if (k === 'challenge') return 'challenge';
  return 'endless';
}

export class HttpTaskService implements ITaskService {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

  async createTask(input: {
    taskId: string;
    groupId: string;
    progressId: string;
    name: string;
    goal: number;
    status: string;
    kind: string;
    params: TaskParams;
  }): Promise<Result<void>> {
    let response: Response;
    try {
      const actingUser = CurrentUser.get();
      if (!actingUser) return { ok: false, error: { code: 'unauthorized' } };
      const headers = await buildAuthHeaders();
      const body = JSON.stringify({
        task_type: mapTaskType(input.kind),
        name: input.name,
        description: '',
        goal: input.goal,
        unit: null,
        deadline: null,
        frequency: null,
        photo_required: input.params.photoRequired,
        color: input.params.color,
        notifications: input.params.notifications,
      });
      response = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(actingUser)}/taskgroups/${encodeURIComponent(
          input.groupId,
        )}/tasks`,
        { method: 'POST', headers: { ...headers, ...JSON_HEADERS }, body },
      );
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 400) return { ok: false, error: { code: 'validation' } };
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      if (response.status === 401) return { ok: false, error: { code: 'unauthorized' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    return { ok: true, value: undefined };
  }

  async editTask(
    taskId: string,
    input: { name?: string; goal?: number; status?: string; params?: Partial<TaskParams> },
  ): Promise<Result<void>> {
    let response: Response;
    try {
      const actingUser = CurrentUser.get();
      if (!actingUser) return { ok: false, error: { code: 'unauthorized' } };
      const headers = await buildAuthHeaders();
      response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(actingUser)}/tasks/${encodeURIComponent(
        taskId,
      )}`, {
        method: 'PATCH',
        headers: { ...headers, ...JSON_HEADERS },
        body: JSON.stringify({ name: input.name, goal: input.goal }),
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 400) return { ok: false, error: { code: 'validation' } };
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    return { ok: true, value: undefined };
  }

  async deleteTask(taskId: string): Promise<Result<void>> {
    let response: Response;
    try {
      const actingUser = CurrentUser.get();
      if (!actingUser) return { ok: false, error: { code: 'unauthorized' } };
      const headers = await buildAuthHeaders();
      response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(actingUser)}/tasks/${encodeURIComponent(
        taskId,
      )}`, {
        method: 'DELETE',
        headers: { ...headers },
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      if (response.status === 404) return { ok: false, error: { code: 'not-found' } };
      return { ok: false, error: { code: `http-${response.status}` } };
    }

    return { ok: true, value: undefined };
  }

  async addProgress(input: {
    entryId: string;
    taskId: string;
    authorUserId: string;
    value: number;
    note: string;
  }): Promise<Result<void>> {
    // Need to resolve the TaskProgress id for this user and task
    try {
      const headers = await buildAuthHeaders();
      const progressRes = await fetch(`${this.baseUrl}/tasks/${encodeURIComponent(input.taskId)}/progress`, {
        method: 'GET',
        headers: { ...headers },
      });
      if (!progressRes.ok) return { ok: false, error: { code: 'not-found' } };
      const parsed = await progressRes.json();
      const actingUser = CurrentUser.get() ?? input.authorUserId;
      const item = (parsed.items || []).find((p: any) => p.user_id === actingUser || p.userId === actingUser);
      if (!item) return { ok: false, error: { code: 'not-found' } };

      const updateRes = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(actingUser)}/task-progress/${encodeURIComponent(item.id)}/update`,
        {
          method: 'POST',
          headers: { ...headers, ...JSON_HEADERS },
          body: JSON.stringify({ delta_value: input.value, message: input.note, photo_url: null }),
        },
      );
      if (!updateRes.ok) return { ok: false, error: { code: `http-${updateRes.status}` } };
      return { ok: true, value: undefined };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async addComment(input: {
    commentId: string;
    progressEntryId: string;
    authorUserId: string;
    message: string;
  }): Promise<Result<void>> {
    try {
      const actingUser = CurrentUser.get() ?? input.authorUserId;
      const headers = await buildAuthHeaders();
      const res = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(actingUser)}/progress-entries/${encodeURIComponent(
          input.progressEntryId,
        )}/comments`,
        {
          method: 'POST',
          headers: { ...headers, ...JSON_HEADERS },
          body: JSON.stringify({ message: input.message }),
        },
      );
      if (!res.ok) return { ok: false, error: { code: `http-${res.status}` } };
      return { ok: true, value: undefined };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async deleteComment(input: { commentId: string; progressEntryId: string }): Promise<Result<void>> {
    try {
      const res = await fetch(`${this.baseUrl}/comments/${encodeURIComponent(input.commentId)}`, {
        method: 'DELETE',
        headers: JSON_HEADERS,
      });
      if (!res.ok) return { ok: false, error: { code: `http-${res.status}` } };
      return { ok: true, value: undefined };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async getTask(taskId: string): Promise<
    Result<{
      name: string;
      goal: number;
      progressId: string;
      params: TaskParams;
    }>
  > {
    try {
      const headers = await buildAuthHeaders();
      const res = await fetch(`${this.baseUrl}/tasks/${encodeURIComponent(taskId)}`, {
        method: 'GET',
        headers: { ...headers },
      });
      if (!res.ok) return { ok: false, error: { code: 'not-found' } };
      const parsed = await res.json();
      return {
        ok: true,
        value: {
          name: parsed.task.name,
          goal: parsed.task.goal,
          progressId: '',
          params: {
            photoRequired: parsed.params?.photo_required ?? false,
            color: parsed.params?.color ?? '',
            notifications: parsed.params?.notifications ?? false,
          },
        },
      };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async getProgressEntries(taskId: string): Promise<
    Result<
      Array<{
        entryId: string;
        value: number;
        commentIds: string[];
      }>
    >
  > {
    try {
      const headers = await buildAuthHeaders();
      const res = await fetch(`${this.baseUrl}/tasks/${encodeURIComponent(taskId)}/progress-entries`, {
        method: 'GET',
        headers: { ...headers },
      });
      if (!res.ok) return { ok: false, error: { code: 'not-found' } };
      const parsed = await res.json();
      const items = (parsed.items || []).map((it: any) => ({ entryId: it.id, value: it.value, commentIds: [] }));
      return { ok: true, value: items };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }
}

export const httpTaskService = new HttpTaskService();
