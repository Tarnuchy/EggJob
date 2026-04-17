import type { ReducerResult } from "../reducer";
import type { FrontendState } from "../state";

type TaskGroupAction = { type: string; [key: string]: unknown };

export function handleTaskGroups(
  state: FrontendState,
  action: TaskGroupAction
): ReducerResult {
  if (action.type === "task-groups/create") {
    const { groupId, ownerUserId, name, privacy, inviteCode } = action as {
      type: string;
      groupId: string;
      ownerUserId: string;
      name: string;
      privacy: string;
      inviteCode?: string;
    };

    if (!name || name.trim().length === 0) {
      return { ok: false, error: { code: "validation", field: "name" } };
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
              inviteCode: inviteCode ?? "",
              taskIds: [],
              memberIds: [],
            },
          },
        },
      },
    };
  }

  if (action.type === "task-groups/edit") {
    const groupId = action.groupId as string;
    const name = action.name as string | undefined;
    const privacy = action.privacy as string | undefined;

    if (name !== undefined && name.trim().length === 0) {
      return { ok: false, error: { code: "validation", field: "name" } };
    }

    const existing = state.entities.taskGroups[groupId];
    if (!existing) {
      return { ok: false, error: { code: "not-found" } };
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

  if (action.type === "task-groups/delete") {
    const groupId = action.groupId as string;
    const group = state.entities.taskGroups[groupId];
    const { [groupId]: _g, ...remainingTaskGroups } = state.entities.taskGroups;

    if (!group) {
      return {
        ok: true,
        value: {
          ...state,
          entities: { ...state.entities, taskGroups: remainingTaskGroups },
        },
      };
    }

    const taskIdsToDelete = new Set(group.taskIds);

    const remainingTasks = Object.fromEntries(
      Object.entries(state.entities.tasks).filter(
        ([taskId]) => !taskIdsToDelete.has(taskId)
      )
    );

    const progressIdsToDelete = new Set(
      group.taskIds
        .map((taskId) => state.entities.tasks[taskId]?.progressId)
        .filter((progressId): progressId is string => Boolean(progressId))
    );

    const remainingTaskProgresses = Object.fromEntries(
      Object.entries(state.entities.taskProgresses).filter(
        ([progressId]) => !progressIdsToDelete.has(progressId)
      )
    );

    const entryIdsToDelete = new Set(
      Object.entries(state.entities.progressEntries)
        .filter(([, entry]) => taskIdsToDelete.has(entry.taskId))
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
          taskGroups: remainingTaskGroups,
          tasks: remainingTasks,
          taskProgresses: remainingTaskProgresses,
          progressEntries: remainingProgressEntries,
          comments: remainingComments,
        },
      },
    };
  }

  if (action.type === "task-groups/add-member") {
    const groupId = action.groupId as string;
    const userId = action.userId as string;
    const group = state.entities.taskGroups[groupId];
    if (!group) {
      return { ok: false, error: { code: "not-found" } };
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

  if (
    action.type === "task-groups/remove-member" ||
    action.type === "task-groups/leave"
  ) {
    const groupId = action.groupId as string;
    const userId = action.userId as string;
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

  return { ok: false, error: { code: "unknown-action" } };
}