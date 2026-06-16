import { useEffect } from 'react';
import { useAppState } from '../application/AppStateContext';
import { selectAllTaskGroups } from '../application/selectors';
import { seedDevData } from '../application/devSeed';
import { useCurrentUserId } from './useCurrentUserId';
import { USE_HTTP_SERVICES } from '../services/http/config';

/**
 * In mock mode, seeds demo data once for the signed-in dev user so every tab (Home
 * included) has content. No-op in HTTP mode (state comes from the backend) and once
 * any group already exists, so it never re-seeds.
 */
export function useDevSeed(): void {
  const { state, dispatch } = useAppState();
  const currentUserId = useCurrentUserId();

  useEffect(() => {
    if (USE_HTTP_SERVICES) return;
    if (selectAllTaskGroups(state).length > 0) return;
    seedDevData(dispatch, currentUserId);
  }, [state, dispatch, currentUserId]);
}
