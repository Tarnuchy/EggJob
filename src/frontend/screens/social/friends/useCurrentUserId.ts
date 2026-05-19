import { useAppState } from '../../../application/AppStateContext';
import { selectCurrentUserId } from '../../../application/selectors';

const DEV_FALLBACK_USER_ID = 'usr-seed-1';

export const useCurrentUserId = (): string => {
  const { state } = useAppState();
  return selectCurrentUserId(state) ?? DEV_FALLBACK_USER_ID;
};
