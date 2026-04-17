import type { FrontendState } from "./state";
import { handleAuth } from "./handlers/auth";
import { handleNotifications } from "./handlers/notifications";
import { handleProfile } from "./handlers/profile";
import { handleSocial } from "./handlers/social";
import { handleTaskGroupAccess } from "./handlers/task-group-access";
import { handleTaskGroups } from "./handlers/task-groups";
import { handleTasks } from "./handlers/tasks";

type Action = { type: string; [key: string]: unknown };
export type ReducerResult =
  | { ok: true; value: FrontendState }
  | { ok: false; error: { code: string; field?: string } };

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
      return handleProfile(state, action);

    case "friends/invite":
    case "friends/accept-invite":
    case "friends/reject-invite":
    case "friends/remove":
      return handleSocial(state, action);

    case "task-groups/create":
    case "task-groups/edit":
    case "task-groups/delete":
    case "task-groups/add-member":
    case "task-groups/remove-member":
    case "task-groups/leave":
      return handleTaskGroups(state, action);

    case "task-groups/invite-friend":
    case "task-groups/cancel-invitation":
    case "task-groups/accept-invitation":
    case "task-groups/request-join":
    case "task-groups/accept-request":
    case "task-groups/reject-request":
      return handleTaskGroupAccess(state, action);

    case "tasks/create":
    case "tasks/edit":
    case "tasks/delete":
    case "tasks/add-progress":
    case "tasks/add-comment":
    case "tasks/delete-comment":
      return handleTasks(state, action);

    case "notifications/add":
    case "notifications/read":
      return handleNotifications(state, action);

    default:
      return { ok: false, error: { code: "unknown-action" } };
  }
}
