import type { ActionOf } from '../actions';
import { cascadeDeleteTask } from '../helpers/cascade';
import type { ReducerResult } from '../reducer';
import type { FrontendState } from '../state';

type TaskAction = ActionOf<
  | 'tasks/create'
  | 'tasks/edit'
  | 'tasks/delete'
  | 'tasks/add-progress'
  | 'tasks/set-progress'
  | 'tasks/add-comment'
  | 'tasks/delete-comment'
>;

export function handleTasks(state: FrontendState, action: TaskAction): ReducerResult {
  if (action.type === 'tasks/create') {
    const { taskId, groupId, progressId, name, goal, params, kind } = action;

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
          tasks: {
            ...state.entities.tasks,
            [taskId]: { name, goal, progressId, params, ...(kind ? { kind } : {}) },
          },
          taskProgresses: {
            ...state.entities.taskProgresses,
            [progressId]: { value: 0 },
          },
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: { ...group, taskIds: [...group.taskIds, taskId] },
          },
        },
      },
    };
  }

  if (action.type === 'tasks/edit') {
    const { taskId, name, goal, params, kind } = action;

    const existing = state.entities.tasks[taskId];
    if (!existing) {
      return { ok: false, error: { code: 'not-found' } };
    }

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          tasks: {
            ...state.entities.tasks,
            [taskId]: {
              ...existing,
              ...(name !== undefined ? { name } : {}),
              ...(goal !== undefined ? { goal } : {}),
              ...(kind !== undefined ? { kind } : {}),
              params: params ? { ...existing.params, ...params } : existing.params,
            },
          },
        },
      },
    };
  }

  if (action.type === 'tasks/delete') {
    return { ok: true, value: cascadeDeleteTask(state, action.taskId) };
  }

  if (action.type === 'tasks/add-progress') {
    const { entryId, taskId, value, note, photoUrl, createdAt } = action;

    if (value < 0) {
      return { ok: false, error: { code: 'validation', field: 'value' } };
    }

    const task = state.entities.tasks[taskId];
    if (!task) {
      return { ok: false, error: { code: 'not-found' } };
    }

    const progressId = task.progressId;
    const currentProgress = state.entities.taskProgresses[progressId];

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          progressEntries: {
            ...state.entities.progressEntries,
            [entryId]: {
              taskId,
              value,
              commentIds: [],
              ...(note !== undefined ? { message: note } : {}),
              ...(photoUrl !== undefined ? { photoUrl } : {}),
              ...(createdAt !== undefined ? { createdAt: createdAt.toISOString() } : {}),
            },
          },
          taskProgresses: {
            ...state.entities.taskProgresses,
            [progressId]: { value: (currentProgress?.value ?? 0) + value },
          },
        },
      },
    };
  }

  if (action.type === 'tasks/set-progress') {
    const { taskId, value } = action;

    if (value < 0) {
      return { ok: false, error: { code: 'validation', field: 'value' } };
    }

    const task = state.entities.tasks[taskId];
    if (!task) {
      return { ok: false, error: { code: 'not-found' } };
    }

    // ustawienie absolutnej wartości progresu (używane m.in. do przełączania komórek bingo)
    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          taskProgresses: {
            ...state.entities.taskProgresses,
            [task.progressId]: { value },
          },
        },
      },
    };
  }

  if (action.type === 'tasks/add-comment') {
    const { commentId, progressEntryId, message } = action;

    const entry = state.entities.progressEntries[progressEntryId];
    if (!entry) {
      return { ok: false, error: { code: 'not-found' } };
    }

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          comments: {
            ...state.entities.comments,
            [commentId]: { message },
          },
          progressEntries: {
            ...state.entities.progressEntries,
            [progressEntryId]: {
              ...entry,
              commentIds: [...entry.commentIds, commentId],
            },
          },
        },
      },
    };
  }

  const { commentId, progressEntryId } = action;

  const { [commentId]: _comment, ...remainingComments } = state.entities.comments;
  const entry = state.entities.progressEntries[progressEntryId];

  return {
    ok: true,
    value: {
      ...state,
      entities: {
        ...state.entities,
        comments: remainingComments,
        progressEntries: entry
          ? {
              ...state.entities.progressEntries,
              [progressEntryId]: {
                ...entry,
                commentIds: entry.commentIds.filter((id) => id !== commentId),
              },
            }
          : state.entities.progressEntries,
      },
    },
  };
}
