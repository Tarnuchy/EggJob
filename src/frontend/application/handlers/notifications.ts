import type { ActionOf } from '../actions';
import type { ReducerResult } from '../reducer';
import type { FrontendState } from '../state';

type NotificationAction = ActionOf<'notifications/add' | 'notifications/read'>;

export function handleNotifications(
  state: FrontendState,
  action: NotificationAction,
): ReducerResult {
  if (action.type === 'notifications/add') {
    const { notificationId } = action;

    return {
      ok: true,
      value: {
        ...state,
        entities: {
          ...state.entities,
          notifications: {
            ...state.entities.notifications,
            [notificationId]: { active: true },
          },
        },
      },
    };
  }

  const { notificationId } = action;
  const existing = state.entities.notifications[notificationId];
  if (!existing) {
    return { ok: false, error: { code: 'not-found' } };
  }

  return {
    ok: true,
    value: {
      ...state,
      entities: {
        ...state.entities,
        notifications: {
          ...state.entities.notifications,
          [notificationId]: { ...existing, active: false },
        },
      },
    },
  };
}
