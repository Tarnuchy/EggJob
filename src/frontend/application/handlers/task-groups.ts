import type { ActionOf } from '../actions';
import { cascadeDeleteGroup } from '../helpers/cascade';
import type { ReducerResult } from '../reducer';
import type { FrontendState } from '../state';

type TaskGroupAction = ActionOf<
  | 'task-groups/create'
  | 'task-groups/edit'
  | 'task-groups/delete'
  | 'task-groups/add-member'
  | 'task-groups/remove-member'
  | 'task-groups/leave'
>;

export function handleTaskGroups(state: FrontendState, action: TaskGroupAction): ReducerResult {
  if (action.type === 'task-groups/create') {
    const { groupId, ownerUserId, name, privacy, inviteCode } = action;

    if (!name || name.trim().length === 0) {
      return { ok: false, error: { code: 'validation', field: 'name' } };
    }

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: {
              name: name.trim(),
              ownerUserId,
              privacy,
              inviteCode: inviteCode ?? '',
              taskIds: [],
              memberIds: [],
            },
          },
        },
      },
    };
  }

  if (action.type === 'task-groups/edit') {
    const { groupId, name, privacy } = action;

    if (name !== undefined && name.trim().length === 0) {
      return { ok: false, error: { code: 'validation', field: 'name' } };
    }

    const existing = state.entities.taskGroups[groupId];
    if (!existing) {
      return { ok: false, error: { code: 'not-found' } };
    }

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: {
              ...existing,
              ...(name !== undefined ? { name: name.trim() } : {}),
              ...(privacy !== undefined ? { privacy } : {}),
            },
          },
        },
      },
    };
  }

  if (action.type === 'task-groups/delete') {
    return { ok: true, value: cascadeDeleteGroup(state, action.groupId) };
  }

  if (action.type === 'task-groups/add-member') {
    const { groupId, userId } = action;
    const group = state.entities.taskGroups[groupId];
    if (!group) {
      return { ok: false, error: { code: 'not-found' } };
    }

    if (group.memberIds.includes(userId)) {
      return { ok: true, value: state };
    }

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: { ...group, memberIds: [...group.memberIds, userId] },
          },
        },
      },
    };
  }

  const { groupId, userId } = action;
  const group = state.entities.taskGroups[groupId];
  if (!group) {
    return { ok: false, error: { code: 'not-found' } };
  }

  return {
    ok: true,
    value: {
      ...state,
      entities: {
        ...state.entities,
        taskGroups: {
          ...state.entities.taskGroups,
          [groupId]: {
            ...group,
            memberIds: group.memberIds.filter((id) => id !== userId),
          },
        },
      },
    },
  };
}
