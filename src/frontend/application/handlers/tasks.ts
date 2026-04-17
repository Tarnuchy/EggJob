import type { ReducerResult } from "../reducer";
import type { FrontendState } from "../state";

type TaskAction = { type: string; [key: string]: unknown };

export function handleTasks(
  state: FrontendState,
  action: TaskAction
): ReducerResult {
  if (action.type === "tasks/create") {
    const { taskId, groupId, progressId, name, goal, params } = action as {
      type: string;
      taskId: string;
      groupId: string;
      progressId: string;
      name: string;
      goal: number;
      status: string;
      kind: string;
      params: {
        photoRequired: boolean;
        color: string;
        notifications: boolean;
      };
    };

    const group = state.entities.taskGroups[groupId];
    if (!group) {
      return { ok: false, error: { code: "not-found" } };
    }

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          tasks: {
            ...state.entities.tasks,
            [taskId]: { name, goal, progressId, params },
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

  if (action.type === "tasks/edit") {
    const taskId = action.taskId as string;
    const name = action.name as string | undefined;
    const goal = action.goal as number | undefined;
    const params =
      action.params as
        | Partial<{
            photoRequired: boolean;
            color: string;
            notifications: boolean;
          }>
        | undefined;

    const existing = state.entities.tasks[taskId];
    if (!existing) {
      return { ok: false, error: { code: "not-found" } };
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
              params: params ? { ...existing.params, ...params } : existing.params,
            },
          },
        },
      },
    };
  }

  if (action.type === "tasks/delete") {
    const taskId = action.taskId as string;
    const task = state.entities.tasks[taskId];
    const { [taskId]: _task, ...remainingTasks } = state.entities.tasks;

    const updatedGroups = Object.fromEntries(
      Object.entries(state.entities.taskGroups).map(([groupId, group]) => [
        groupId,
        { ...group, taskIds: group.taskIds.filter((id) => id !== taskId) },
      ])
    );

    if (!task) {
      return {
        ok: true,
        value: {
          ...state,
          entities: {
            ...state.entities,
            tasks: remainingTasks,
            taskGroups: updatedGroups,
          },
        },
      };
    }

    const { [task.progressId]: _progress, ...remainingTaskProgresses } =
      state.entities.taskProgresses;

    const entryIdsToDelete = new Set(
      Object.entries(state.entities.progressEntries)
        .filter(([, entry]) => entry.taskId === taskId)
        .map(([entryId]) => entryId)
    );

    const commentIdsToDelete = new Set<string>();
    for (const entryId of entryIdsToDelete) {
      const entry = state.entities.progressEntries[entryId];
      if (!entry) {
        continue;
      }
      for (const commentId of entry.commentIds) {
        commentIdsToDelete.add(commentId);
      }
    }

    const remainingProgressEntries = Object.fromEntries(
      Object.entries(state.entities.progressEntries).filter(
        ([entryId]) => !entryIdsToDelete.has(entryId)
      )
    );

    const remainingComments = Object.fromEntries(
      Object.entries(state.entities.comments).filter(
        ([commentId]) => !commentIdsToDelete.has(commentId)
      )
    );

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          tasks: remainingTasks,
          taskGroups: updatedGroups,
          taskProgresses: remainingTaskProgresses,
          progressEntries: remainingProgressEntries,
          comments: remainingComments,
        },
      },
    };
  }

  if (action.type === "tasks/add-progress") {
    const { entryId, taskId, value } = action as {
      type: string;
      entryId: string;
      taskId: string;
      authorUserId: string;
      value: number;
      note: string;
    };

    if (value < 0) {
      return { ok: false, error: { code: "validation", field: "value" } };
    }

    const task = state.entities.tasks[taskId];
    if (!task) {
      return { ok: false, error: { code: "not-found" } };
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
            [entryId]: { taskId, value, commentIds: [] },
          },
          taskProgresses: {
            ...state.entities.taskProgresses,
            [progressId]: { value: (currentProgress?.value ?? 0) + value },
          },
        },
      },
    };
  }

  if (action.type === "tasks/add-comment") {
    const commentId = action.commentId as string;
    const progressEntryId = action.progressEntryId as string;
    const message = action.message as string;

    const entry = state.entities.progressEntries[progressEntryId];
    if (!entry) {
      return { ok: false, error: { code: "not-found" } };
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

  if (action.type === "tasks/delete-comment") {
    const commentId = action.commentId as string;
    const progressEntryId = action.progressEntryId as string;

    const { [commentId]: _comment, ...remainingComments } =
      state.entities.comments;
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

  return { ok: false, error: { code: "unknown-action" } };
}