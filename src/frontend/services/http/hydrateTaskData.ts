import type {
  MemberRole,
  Task,
  TaskGroup,
  TaskProgress,
  User,
} from '../../application/state';
import type { Result } from '../types/index';
import { DEFAULT_TASK_COLOR } from '../../screens/tasks/taskColors';
import { API_BASE_URL } from './config';
import { buildAuthHeaders } from './buildAuthHeaders';
import { notifyUnauthorized } from './authEvents';

export type HydratedTaskData = {
  taskGroups: Record<string, TaskGroup>;
  tasks: Record<string, Task>;
  taskProgresses: Record<string, TaskProgress>;
  users: Record<string, User>;
};

type GroupListItemPayload = {
  group_id: string;
  name: string;
  privacy?: string | null;
  type?: string | null;
  is_bingo?: boolean;
};

type GroupDetailPayload = { invite_code?: string | null };

type MemberPayload = {
  id: string;
  user_id: string;
  username: string;
  role?: string | null;
  active?: boolean;
};

type TaskItemPayload = {
  id: string;
  name?: string | null;
  goal?: number | null;
  type?: string | null;
};

type TaskDetailPayload = {
  params?: {
    photo_required?: boolean;
    color?: string | null;
    notifications?: boolean;
  } | null;
};

type ProgressItemPayload = {
  id: string;
  group_member_id?: string | null;
  value?: number | null;
};

async function getJson<T>(path: string, headers: Record<string, string>): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { method: 'GET', headers });
    if (!response.ok) {
      if (response.status === 401) notifyUnauthorized();
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function toMemberRole(role: string | null | undefined): MemberRole {
  return role === 'owner' || role === 'admin' ? role : 'member';
}

/**
 * Hydratuje pojedynczą grupę (detale, członkowie, taski, parametry, progres) do `result`.
 * Wydzielone, by wyjątek przy jednej grupie nie wywrócił całej hydracji
 * (patrz `fetchHydratedTaskData`).
 */
async function hydrateGroup(
  groupItem: GroupListItemPayload,
  userId: string,
  headers: Record<string, string>,
  result: HydratedTaskData,
): Promise<void> {
  const groupId = groupItem.group_id;

  const detail = await getJson<GroupDetailPayload>(
    `/taskgroups/${encodeURIComponent(groupId)}`,
    headers,
  );
  const inviteCode = detail?.invite_code ?? '';

  const membersJson = await getJson<{ items?: MemberPayload[] }>(
    `/taskgroups/${encodeURIComponent(groupId)}/members`,
    headers,
  );
  let ownerUserId = '';
  let myMemberId: string | null = null;
  const memberIds: string[] = [];
  const memberRoles: Record<string, MemberRole> = {};
  for (const member of membersJson?.items ?? []) {
    if (member.active === false) continue;
    const role = toMemberRole(member.role);
    memberRoles[member.user_id] = role;
    result.users[member.user_id] = { username: member.username };
    if (member.user_id === userId) myMemberId = member.id;
    if (role === 'owner') {
      ownerUserId = member.user_id;
    } else {
      memberIds.push(member.user_id);
    }
  }

  const tasksJson = await getJson<{ items?: TaskItemPayload[] }>(
    `/taskgroups/${encodeURIComponent(groupId)}/tasks`,
    headers,
  );
  const taskIds: string[] = [];
  for (const taskItem of tasksJson?.items ?? []) {
    taskIds.push(taskItem.id);

    const taskDetail = await getJson<TaskDetailPayload>(
      `/tasks/${encodeURIComponent(taskItem.id)}`,
      headers,
    );
    const params = {
      color: taskDetail?.params?.color || DEFAULT_TASK_COLOR,
      photoRequired: taskDetail?.params?.photo_required ?? false,
      notifications: taskDetail?.params?.notifications ?? false,
    };

    const progressJson = await getJson<{ items?: ProgressItemPayload[] }>(
      `/tasks/${encodeURIComponent(taskItem.id)}/progress`,
      headers,
    );
    const progressItems = progressJson?.items ?? [];
    const myProgress =
      progressItems.find((item) => myMemberId !== null && item.group_member_id === myMemberId) ??
      progressItems[0];
    const progressId = myProgress?.id ?? `prg-${taskItem.id}`;
    result.taskProgresses[progressId] = { value: myProgress?.value ?? 0 };

    result.tasks[taskItem.id] = {
      name: taskItem.name ?? '',
      goal: taskItem.goal ?? 1,
      progressId,
      kind: taskItem.type === 'one_time' ? 'one_time' : 'endless',
      params,
    };
  }

  result.taskGroups[groupId] = {
    name: groupItem.name,
    ownerUserId,
    privacy: groupItem.privacy === 'public' ? 'public' : 'private',
    type: groupItem.type === 'competitive' ? 'competitive' : 'cooperative',
    isBingo: groupItem.is_bingo ?? false,
    inviteCode,
    taskIds,
    memberIds,
    memberRoles,
  };
}

/**
 * Pobiera z backendu pełny obraz grup, tasków, parametrów i progresu
 * zalogowanego użytkownika — używane do hydratacji lokalnego stanu.
 *
 * Odporność: wyjątek przy pojedynczej grupie jest pomijany (reszta i tak się
 * załaduje), a każdy nieoczekiwany błąd zwraca `Result.error`, dzięki czemu
 * `useBackendHydration` może ponowić próbę przy kolejnym wejściu.
 */
export async function fetchHydratedTaskData(userId: string): Promise<Result<HydratedTaskData>> {
  try {
    const headers = await buildAuthHeaders();

    const groupsJson = await getJson<{ items?: GroupListItemPayload[] }>(
      `/users/${encodeURIComponent(userId)}/taskgroups`,
      headers,
    );
    if (groupsJson === null) {
      return { ok: false, error: { code: 'network' } };
    }

    const result: HydratedTaskData = { taskGroups: {}, tasks: {}, taskProgresses: {}, users: {} };

    for (const groupItem of groupsJson.items ?? []) {
      try {
        await hydrateGroup(groupItem, userId, headers, result);
      } catch {
        // jedna wadliwa grupa nie może wywrócić całej hydracji — pomijamy ją
      }
    }

    return { ok: true, value: result };
  } catch {
    return { ok: false, error: { code: 'network' } };
  }
}
