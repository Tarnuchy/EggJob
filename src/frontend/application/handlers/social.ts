import type { ReducerResult } from "../reducer";
import type { FrontendState } from "../state";

type SocialAction = { type: string; [key: string]: unknown };

export function handleSocial(
  state: FrontendState,
  action: SocialAction
): ReducerResult {
  if (action.type === "friends/invite") {
    const invitationId = action.invitationId as string;
    const fromUserId = action.fromUserId as string;
    const toUserId = action.toUserId as string;

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: {
            ...state.entities.invitations,
            [invitationId]: { kind: "friend", fromUserId, toUserId },
          },
        },
      },
    };
  }

  if (action.type === "friends/accept-invite") {
    const invitationId = action.invitationId as string;
    const friendshipId = action.friendshipId as string;

    const invitation = state.entities.invitations[invitationId];
    const { [invitationId]: _inv, ...remainingInvitations } =
      state.entities.invitations;

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          invitations: remainingInvitations,
          friendships: {
            ...state.entities.friendships,
            [friendshipId]: {
              userId: invitation?.fromUserId ?? "",
              friendUserId: invitation?.toUserId ?? "",
            },
          },
        },
      },
    };
  }

  if (action.type === "friends/reject-invite") {
    const invitationId = action.invitationId as string;
    const { [invitationId]: _inv, ...remainingInvitations } =
      state.entities.invitations;

    return {
      ok: true,
      value: {
        ...state,
        entities: { ...state.entities, invitations: remainingInvitations },
      },
    };
  }

  if (action.type === "friends/remove") {
    const friendshipId = action.friendshipId as string;
    const { [friendshipId]: _fr, ...remainingFriendships } =
      state.entities.friendships;

    return {
      ok: true,
      value: {
        ...state,
        entities: { ...state.entities, friendships: remainingFriendships },
      },
    };
  }

  return { ok: false, error: { code: "unknown-action" } };
}