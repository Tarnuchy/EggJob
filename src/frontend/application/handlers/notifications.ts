import type { ReducerResult } from "../reducer";
import type { FrontendState } from "../state";

type NotificationAction = { type: string; [key: string]: unknown };

export function handleNotifications(
  state: FrontendState,
  action: NotificationAction
): ReducerResult {
  if (action.type === "notifications/add") {
    const notificationId = action.notificationId as string;

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

  if (action.type === "notifications/read") {
    const notificationId = action.notificationId as string;
    const existing = state.entities.notifications[notificationId];
    if (!existing) {
      return { ok: false, error: { code: "not-found" } };
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

  return { ok: false, error: { code: "unknown-action" } };
}