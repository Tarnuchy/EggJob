import type { FrontendState, Invitation, Notification, Task, TaskGroup, User } from './state';

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
