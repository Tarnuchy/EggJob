import { useEffect, useRef } from 'react';
import { useAppState } from '../application/AppStateContext';
import { USE_HTTP_SERVICES } from '../services/http/config';
import { fetchHydratedTaskData } from '../services/http/hydrateTaskData';

/**
 * Po zalogowaniu (tryb HTTP) jednorazowo zaciąga grupy, taski i progres
 * z backendu i podmienia lokalne encje stanu.
 */
export function useBackendHydration(): void {
  const { state, dispatch } = useAppState();
  const userId = state.session.currentUserId;
  const hydratedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!USE_HTTP_SERVICES || !userId || hydratedForUser.current === userId) {
      return;
    }
    hydratedForUser.current = userId;

    let cancelled = false;
    fetchHydratedTaskData(userId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        dispatch({ type: 'hydrate/task-data', ...result.value });
      } else {
        // pozwól spróbować ponownie przy kolejnym wejściu
        hydratedForUser.current = null;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch, userId]);
}
