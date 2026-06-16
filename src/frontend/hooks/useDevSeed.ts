import { useEffect, useRef } from 'react';
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
  const seeded = useRef(false);

  useEffect(() => {
    if (USE_HTTP_SERVICES || seeded.current) return;
    if (selectAllTaskGroups(state).length > 0) {
      seeded.current = true;
      return;
    }
    seedDevData(dispatch, currentUserId);
    seeded.current = true;
  }, [state, dispatch, currentUserId]);
}
