import type { FrontendState } from "./state";
import { handleAuth } from "./handlers/auth";

type Action = { type: string; [key: string]: unknown };
export type ReducerResult =
  | { ok: true; value: FrontendState }
  | { ok: false; error: { code: string; field?: string } };

const notImplemented = (): ReducerResult =>
  ({ ok: false, error: { code: "not-implemented" } });

export function reduceFrontendState(
  state: FrontendState,
  action: Action
): ReducerResult {
  switch (action.type) {
    case "auth/register":
    case "auth/login":
    case "auth/logout":
      return handleAuth(state, action);

    case "profile/edit":
    case "account/delete":
      return notImplemented();

    case "friends/invite":
    case "friends/accept-invite":
    case "friends/reject-invite":
    case "friends/remove":
      return notImplemented();

    case "task-groups/create":
    case "task-groups/edit":
    case "task-groups/delete":
    case "task-groups/add-member":
    case "task-groups/remove-member":
    case "task-groups/leave":
      return notImplemented();

    case "task-groups/invite-friend":
    case "task-groups/cancel-invitation":
    case "task-groups/accept-invitation":
    case "task-groups/request-join":
    case "task-groups/accept-request":
    case "task-groups/reject-request":
      return notImplemented();

    case "tasks/create":
    case "tasks/edit":
    case "tasks/delete":
    case "tasks/add-progress":
    case "tasks/add-comment":
    case "tasks/delete-comment":
      return notImplemented();

    case "notifications/add":
    case "notifications/read":
      return notImplemented();

    default:
      return { ok: false, error: { code: "unknown-action" } };
  }
}
