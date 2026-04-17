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
    const { [groupId]: _g, ...remaining } = state.entities.taskGroups;

    return {
      ok: true,
      value: {
        ...state,
        entities: { ...state.entities, taskGroups: remaining },
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