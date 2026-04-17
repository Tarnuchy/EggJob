import type { ReducerResult } from "../reducer";
import type { FrontendState } from "../state";

type AccessAction = { type: string; [key: string]: unknown };

export function handleTaskGroupAccess(
  state: FrontendState,
  action: AccessAction
): ReducerResult {
  if (action.type === "task-groups/invite-friend") {
    const { invitationId, groupId, fromUserId, toUserId } = action as {
      type: string;
      invitationId: string;
      groupId: string;
      fromUserId: string;
      toUserId: string;
      permissions: string;
    };

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: {
            ...state.entities.invitations,
            [invitationId]: { kind: "task-group", fromUserId, toUserId, groupId },
          },
        },
      },
    };
  }

  if (action.type === "task-groups/cancel-invitation") {
    const invitationId = action.invitationId as string;
    const { [invitationId]: _inv, ...remaining } = state.entities.invitations;

    return {
      ok: true,
      value: {
        ...state,
        entities: { ...state.entities, invitations: remaining },
      },
    };
  }

  if (action.type === "task-groups/accept-invitation") {
    const invitationId = action.invitationId as string;
    const groupId = action.groupId as string;
    const userId = action.userId as string;

    const { [invitationId]: _inv, ...remainingInvitations } =
      state.entities.invitations;
    const group = state.entities.taskGroups[groupId];
    if (!group) {
      return { ok: false, error: { code: "not-found" } };
    }

    const memberIds = group.memberIds.includes(userId)
      ? group.memberIds
      : [...group.memberIds, userId];

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: remainingInvitations,
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: { ...group, memberIds },
          },
        },
      },
    };
  }

  if (action.type === "task-groups/request-join") {
    const { invitationId, groupId, inviteCode, fromUserId, toUserId } =
      action as {
        type: string;
        invitationId: string;
        groupId: string;
        inviteCode: string;
        fromUserId: string;
        toUserId: string;
        permissions: string;
      };

    const group = state.entities.taskGroups[groupId];
    if (!group) {
      return { ok: false, error: { code: "not-found" } };
    }

    if (group.inviteCode && inviteCode !== group.inviteCode) {
      return { ok: false, error: { code: "validation", field: "inviteCode" } };
    }

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: {
            ...state.entities.invitations,
            [invitationId]: {
              kind: "task-group-request",
              fromUserId,
              toUserId,
              groupId,
            },
          },
        },
      },
    };
  }

  if (action.type === "task-groups/accept-request") {
    const invitationId = action.invitationId as string;
    const groupId = action.groupId as string;
    const userId = action.userId as string;

    const { [invitationId]: _inv, ...remainingInvitations } =
      state.entities.invitations;
    const group = state.entities.taskGroups[groupId];
    if (!group) {
      return { ok: false, error: { code: "not-found" } };
    }

    const memberIds = group.memberIds.includes(userId)
      ? group.memberIds
      : [...group.memberIds, userId];

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: remainingInvitations,
          taskGroups: {
            ...state.entities.taskGroups,
            [groupId]: { ...group, memberIds },
          },
        },
      },
    };
  }

  if (action.type === "task-groups/reject-request") {
    const invitationId = action.invitationId as string;
    const { [invitationId]: _inv, ...remaining } = state.entities.invitations;

    return {
      ok: true,
      value: {
        ...state,
        entities: { ...state.entities, invitations: remaining },
      },
    };
  }

  return { ok: false, error: { code: "unknown-action" } };
}