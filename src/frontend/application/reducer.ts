import type { AppAction } from './actions';
import { handleAuth } from './handlers/auth';
import { handleHydration } from './handlers/hydration';
import { handleNotifications } from './handlers/notifications';
import { handleProfile } from './handlers/profile';
import { handleSocial } from './handlers/social';
import { handleTaskGroupAccess } from './handlers/task-group-access';
import { handleTaskGroups } from './handlers/task-groups';
import { handleTasks } from './handlers/tasks';
import type { FrontendState } from './state';

export type ReducerResult =
  | { ok: true; value: FrontendState }
  | { ok: false; error: { code: string; field?: string } };

export function reduceFrontendState(state: FrontendState, action: AppAction): ReducerResult {
  switch (action.type) {
    case 'auth/register':
    case 'auth/login':
    case 'auth/logout':
      return handleAuth(state, action);

    case 'profile/edit':
    case 'account/delete':
      return handleProfile(state, action);

    case 'friends/invite':
    case 'friends/accept-invite':
    case 'friends/reject-invite':
    case 'friends/remove':
      return handleSocial(state, action);

    case 'task-groups/create':
    case 'task-groups/edit':
    case 'task-groups/delete':
    case 'task-groups/add-member':
    case 'task-groups/remove-member':
    case 'task-groups/change-role':
    case 'task-groups/leave':
      return handleTaskGroups(state, action);

    case 'task-groups/invite-friend':
    case 'task-groups/cancel-invitation':
    case 'task-groups/accept-invitation':
    case 'task-groups/request-join':
    case 'task-groups/accept-request':
    case 'task-groups/reject-request':
      return handleTaskGroupAccess(state, action);

    case 'tasks/create':
    case 'tasks/edit':
    case 'tasks/delete':
    case 'tasks/add-progress':
    case 'tasks/set-progress':
    case 'tasks/delete-progress-entry':
    case 'tasks/add-comment':
    case 'tasks/delete-comment':
      return handleTasks(state, action);

    case 'notifications/add':
    case 'notifications/read':
      return handleNotifications(state, action);

    case 'hydrate/task-data':
      return handleHydration(state, action);

    default: {
      const exhaustive: never = action;
      void exhaustive;
      return { ok: false, error: { code: 'unknown-action' } };
    }
  }
}
