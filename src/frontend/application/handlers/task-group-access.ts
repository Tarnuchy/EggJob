import type { ActionOf } from '../actions';
import type { ReducerResult } from '../reducer';
import type { FrontendState } from '../state';

type AccessAction = ActionOf<
  | 'task-groups/invite-friend'
  | 'task-groups/cancel-invitation'
  | 'task-groups/accept-invitation'
  | 'task-groups/request-join'
  | 'task-groups/accept-request'
  | 'task-groups/reject-request'
>;

export function handleTaskGroupAccess(state: FrontendState, action: AccessAction): ReducerResult {
  if (action.type === 'task-groups/invite-friend') {
    const { invitationId, groupId, fromUserId, toUserId } = action;

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: {
            ...state.entities.invitations,
            [invitationId]: { kind: 'task-group', fromUserId, toUserId, groupId },
          },
        },
      },
    };
  }

  if (action.type === 'task-groups/cancel-invitation') {
    const { invitationId } = action;
    const { [invitationId]: _inv, ...remaining } = state.entities.invitations;

    return {
      ok: true,
      value: {
        ...state,
        entities: { ...state.entities, invitations: remaining },
      },
    };
  }

  if (action.type === 'task-groups/accept-invitation') {
    const { invitationId, groupId, userId } = action;

    const { [invitationId]: _inv, ...remainingInvitations } = state.entities.invitations;
    const group = state.entities.taskGroups[groupId];
    if (!group) {
      return { ok: false, error: { code: 'not-found' } };
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

  if (action.type === 'task-groups/request-join') {
    const { invitationId, groupId, inviteCode, fromUserId, toUserId } = action;

    const group = state.entities.taskGroups[groupId];
    if (!group) {
      return { ok: false, error: { code: 'not-found' } };
    }

    if (group.inviteCode && inviteCode !== group.inviteCode) {
      return { ok: false, error: { code: 'validation', field: 'inviteCode' } };
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
              kind: 'task-group-request',
              fromUserId,
              toUserId,
              groupId,
            },
          },
        },
      },
    };
  }

  if (action.type === 'task-groups/accept-request') {
    const { invitationId, groupId, userId } = action;

    const { [invitationId]: _inv, ...remainingInvitations } = state.entities.invitations;
    const group = state.entities.taskGroups[groupId];
    if (!group) {
      return { ok: false, error: { code: 'not-found' } };
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

  const { invitationId } = action;
  const { [invitationId]: _inv, ...remaining } = state.entities.invitations;

  return {
    ok: true,
    value: {
      ...state,
      entities: { ...state.entities, invitations: remaining },
    },
  };
}
