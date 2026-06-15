import type { FrontendState, Invitation, Notification, Task, TaskGroup, TaskGroupType, User } from './state';
import { colors } from '../theme/colors';
import { hasBingoLine } from '../components/tasks/bingoDetection';

export function selectCurrentUserId(state: FrontendState): string | null {
  return state.session.currentUserId;
}

export function selectCurrentAccountId(state: FrontendState): string | null {
  return state.session.currentAccountId;
}

export function selectCurrentUser(state: FrontendState): User | null {
  const userId = state.session.currentUserId;
  if (!userId) return null;
  return state.entities.users[userId] ?? null;
}

export function selectAllTasks(state: FrontendState): Array<{ id: string; task: Task }> {
  return Object.entries(state.entities.tasks).map(([id, task]) => ({ id, task }));
}

export function selectTasksByGroup(
  state: FrontendState,
  groupId: string,
): Array<{ id: string; task: Task }> {
  const group = state.entities.taskGroups[groupId];
  if (!group) return [];
  return group.taskIds
    .map((taskId) => {
      const task = state.entities.tasks[taskId];
      return task ? { id: taskId, task } : null;
    })
    .filter((entry): entry is { id: string; task: Task } => entry !== null);
}

export function selectAllTaskGroups(state: FrontendState): Array<{ id: string; group: TaskGroup }> {
  return Object.entries(state.entities.taskGroups).map(([id, group]) => ({ id, group }));
}

export function selectTaskGroupsByMember(
  state: FrontendState,
  userId: string,
): Array<{ id: string; group: TaskGroup }> {
  return Object.entries(state.entities.taskGroups)
    .filter(([, group]) => group.memberIds.includes(userId) || group.ownerUserId === userId)
    .map(([id, group]) => ({ id, group }));
}

export function selectActiveNotifications(
  state: FrontendState,
): Array<{ id: string; notification: Notification }> {
  return Object.entries(state.entities.notifications)
    .filter(([, notification]) => notification.active)
    .map(([id, notification]) => ({ id, notification }));
}

export function selectFriendInvitations(
  state: FrontendState,
  userId: string,
): Array<{ id: string; invitation: Invitation }> {
  return Object.entries(state.entities.invitations)
    .filter(([, invitation]) => invitation.kind === 'friend' && invitation.toUserId === userId)
    .map(([id, invitation]) => ({ id, invitation }));
}

export function selectTaskGroupInvitations(
  state: FrontendState,
  userId: string,
): Array<{ id: string; invitation: Invitation }> {
  return Object.entries(state.entities.invitations)
    .filter(([, invitation]) => invitation.kind === 'task-group' && invitation.toUserId === userId)
    .map(([id, invitation]) => ({ id, invitation }));
}

/** Latest ProgressEntry.createdAt per taskId ('' when a task has no dated entries). */
function buildLatestProgressMap(state: FrontendState): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of Object.values(state.entities.progressEntries)) {
    const createdAt = entry.createdAt ?? '';
    const current = map.get(entry.taskId) ?? '';
    if (createdAt > current) map.set(entry.taskId, createdAt);
  }
  return map;
}

export interface HomeActiveTask {
  taskId: string;
  groupId: string;
  groupName: string;
  name: string;
  value: number;
  goal: number;
  color: string;
}

/** The user's not-done tasks (value < goal, goal > 0) across member/owned groups,
 *  newest-progress first; tasks without progress sort last (tie-break: name asc). */
export function selectHomeActiveTasks(
  state: FrontendState,
  userId: string,
  limit: number,
): HomeActiveTask[] {
  const latest = buildLatestProgressMap(state);
  const ranked: Array<HomeActiveTask & { recency: string }> = [];
  for (const { id: groupId, group } of selectTaskGroupsByMember(state, userId)) {
    for (const { id: taskId, task } of selectTasksByGroup(state, groupId)) {
      if (task.goal <= 0) continue;
      const value = state.entities.taskProgresses[task.progressId]?.value ?? 0;
      if (value >= task.goal) continue;
      ranked.push({
        taskId,
        groupId,
        groupName: group.name,
        name: task.name,
        value,
        goal: task.goal,
        color: task.params.color ?? colors.primary,
        recency: latest.get(taskId) ?? '',
      });
    }
  }
  ranked.sort((a, b) =>
    a.recency !== b.recency ? (a.recency < b.recency ? 1 : -1) : a.name.localeCompare(b.name),
  );
  return ranked.slice(0, limit).map(({ recency, ...rest }) => rest);
}

export interface HomeGroupHighlight {
  groupId: string;
  name: string;
  type: TaskGroupType;
  taskCount: number;
  memberCount: number;
  bingo?: { size: number; doneCount: number; totalCount: number; hasBingo: boolean };
}

/** Member/owned groups for the dashboard, with bingo done/total when applicable,
 *  most-recently-active first (tie-break: name asc). */
export function selectHomeGroupHighlights(
  state: FrontendState,
  userId: string,
  limit: number,
): HomeGroupHighlight[] {
  const latest = buildLatestProgressMap(state);
  const ranked = selectTaskGroupsByMember(state, userId).map(({ id: groupId, group }) => {
    const tasks = selectTasksByGroup(state, groupId);
    const doneFlags = tasks.map(({ task }) => {
      const value = state.entities.taskProgresses[task.progressId]?.value ?? 0;
      return task.goal > 0 && value >= task.goal;
    });
    // Bingo boards are seeded with goal>0 tasks; any goal<=0 task counts toward totalCount
    // but is never "done", so it can only ever suppress hasBingo (acceptable).
    const totalCount = tasks.length;
    const sqrt = Math.sqrt(totalCount);
    const size = Math.round(sqrt);
    const isBingoBoard = group.isBingo && Number.isInteger(sqrt) && size >= 3 && size <= 5;
    let recency = '';
    for (const { id: taskId } of tasks) {
      const r = latest.get(taskId) ?? '';
      if (r > recency) recency = r;
    }
    const highlight: HomeGroupHighlight & { recency: string } = {
      groupId,
      name: group.name,
      type: group.type,
      taskCount: totalCount,
      memberCount: group.memberIds.length + 1,
      bingo: isBingoBoard
        ? { size, doneCount: doneFlags.filter(Boolean).length, totalCount, hasBingo: hasBingoLine(doneFlags, size) }
        : undefined,
      recency,
    };
    return highlight;
  });
  ranked.sort((a, b) =>
    a.recency !== b.recency ? (a.recency < b.recency ? 1 : -1) : a.name.localeCompare(b.name),
  );
  return ranked.slice(0, limit).map(({ recency, ...rest }) => rest);
}
