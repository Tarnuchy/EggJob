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
  }): Promise<Result<{ id?: string }>> {
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

    try {
      const parsed = (await response.json()) as { id?: string };
      return { ok: true, value: { id: parsed.id } };
    } catch {
      return { ok: true, value: {} };
    }
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

    if (input.params) {
      try {
        const headers = await buildAuthHeaders();
        const paramsRes = await fetch(`${this.baseUrl}/task-params/${encodeURIComponent(taskId)}`, {
          method: 'PATCH',
          headers: { ...headers, ...JSON_HEADERS },
          body: JSON.stringify({
            photo_required: input.params.photoRequired,
            color: input.params.color,
            notifications: input.params.notifications,
          }),
        });
        if (!paramsRes.ok) return { ok: false, error: { code: `http-${paramsRes.status}` } };
      } catch {
        return { ok: false, error: { code: 'network' } };
      }
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
    photoUrl?: string;
  }): Promise<Result<void>> {
    // TaskProgress is keyed by group member, not user: resolve task -> group -> my member id,
    // then pick my progress row (competitive) or the single shared one (cooperative)
    try {
      const headers = await buildAuthHeaders();
      const actingUser = CurrentUser.get() ?? input.authorUserId;

      const taskRes = await fetch(`${this.baseUrl}/tasks/${encodeURIComponent(input.taskId)}`, {
        method: 'GET',
        headers: { ...headers },
      });
      if (!taskRes.ok) return { ok: false, error: { code: 'not-found' } };
      const taskDetail = (await taskRes.json()) as { task?: { group_id?: string } };
      const groupId = taskDetail.task?.group_id;

      let myMemberId: string | null = null;
      if (groupId) {
        const membersRes = await fetch(
          `${this.baseUrl}/taskgroups/${encodeURIComponent(groupId)}/members`,
          { method: 'GET', headers: { ...headers } },
        );
        if (membersRes.ok) {
          const membersJson = (await membersRes.json()) as {
            items?: Array<{ id: string; user_id: string }>;
          };
          myMemberId = membersJson.items?.find((m) => m.user_id === actingUser)?.id ?? null;
        }
      }

      const progressRes = await fetch(`${this.baseUrl}/tasks/${encodeURIComponent(input.taskId)}/progress`, {
        method: 'GET',
        headers: { ...headers },
      });
      if (!progressRes.ok) return { ok: false, error: { code: 'not-found' } };
      const parsed = (await progressRes.json()) as {
        items?: Array<{ id: string; group_member_id?: string | null }>;
      };
      const items = parsed.items ?? [];
      const item = items.find((p) => myMemberId !== null && p.group_member_id === myMemberId) ?? items[0];
      if (!item) return { ok: false, error: { code: 'not-found' } };

      const updateRes = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(actingUser)}/task-progress/${encodeURIComponent(item.id)}/update`,
        {
          method: 'POST',
          headers: { ...headers, ...JSON_HEADERS },
          body: JSON.stringify({
            delta_value: input.value,
            message: input.note,
            photo_url: input.photoUrl ?? null,
          }),
        },
      );
      if (!updateRes.ok) return { ok: false, error: { code: `http-${updateRes.status}` } };
      return { ok: true, value: undefined };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async setProgress(input: {
    taskId: string;
    authorUserId: string;
    value: number;
  }): Promise<Result<void>> {
    // Backend operuje na deltach (delta_value) — liczymy różnicę względem bieżącej sumy wpisów
    // i delegujemy do addProgress. Używane przez przełączanie komórek bingo.
    const entriesRes = await this.getProgressEntries(input.taskId);
    const current = entriesRes.ok
      ? entriesRes.value.reduce((sum, entry) => sum + entry.value, 0)
      : 0;
    const delta = input.value - current;
    if (delta === 0) {
      return { ok: true, value: undefined };
    }
    return this.addProgress({
      entryId: '',
      taskId: input.taskId,
      authorUserId: input.authorUserId,
      value: delta,
      note: '',
    });
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
      const actingUser = CurrentUser.get();
      if (!actingUser) return { ok: false, error: { code: 'unauthorized' } };
      const headers = await buildAuthHeaders();
      const res = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(actingUser)}/comments/${encodeURIComponent(
          input.commentId,
        )}`,
        { method: 'DELETE', headers: { ...headers } },
      );
      if (!res.ok) {
        if (res.status === 401) return { ok: false, error: { code: 'unauthorized' } };
        if (res.status === 403) return { ok: false, error: { code: 'forbidden' } };
        if (res.status === 404) return { ok: false, error: { code: 'not-found' } };
        return { ok: false, error: { code: `http-${res.status}` } };
      }
      return { ok: true, value: undefined };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }

  async deleteProgressEntry(input: { entryId: string; authorUserId: string }): Promise<Result<void>> {
    try {
      const actingUser = CurrentUser.get() ?? input.authorUserId;
      const headers = await buildAuthHeaders();
      const res = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(actingUser)}/progress-entries/${encodeURIComponent(
          input.entryId,
        )}`,
        { method: 'DELETE', headers: { ...headers } },
      );
      if (!res.ok) {
        if (res.status === 401) return { ok: false, error: { code: 'unauthorized' } };
        if (res.status === 403) return { ok: false, error: { code: 'forbidden' } };
        if (res.status === 404) return { ok: false, error: { code: 'not-found' } };
        return { ok: false, error: { code: `http-${res.status}` } };
      }
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
        message: string;
        photoUrl?: string;
        createdAt: string;
        commentIds: string[];
      }>
    >
  > {
    type ProgressEntryItem = {
      id: string;
      value?: number;
      message?: string;
      photo_url?: string | null;
      created_at?: string;
    };
    try {
      const headers = await buildAuthHeaders();
      const res = await fetch(`${this.baseUrl}/tasks/${encodeURIComponent(taskId)}/progress-entries`, {
        method: 'GET',
        headers: { ...headers },
      });
      if (!res.ok) return { ok: false, error: { code: 'not-found' } };
      const parsed = (await res.json()) as { items?: ProgressEntryItem[] };
      const items = (parsed.items ?? []).map((it) => ({
        entryId: it.id,
        value: it.value ?? 0,
        message: it.message ?? '',
        photoUrl: it.photo_url ?? undefined,
        createdAt: it.created_at ?? '',
        commentIds: [] as string[],
      }));
      return { ok: true, value: items };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }
}

export const httpTaskService = new HttpTaskService();
