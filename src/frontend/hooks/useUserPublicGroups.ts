import { useEffect, useState } from 'react';
import { taskGroupService } from '../services';
import type { UserGroupSummary } from '../services';

interface UseUserPublicGroupsResult {
  groups: UserGroupSummary[];
  loading: boolean;
}

/**
 * Loads the PUBLIC groups a user belongs to (for the profile screen). Private / friends-only
 * groups are filtered out so they never surface on someone else's profile.
 */
export function useUserPublicGroups(userId: string): UseUserPublicGroupsResult {
  const [groups, setGroups] = useState<UserGroupSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const result = await taskGroupService.listUserGroups(userId);
      if (cancelled) return;
      setGroups(result.ok ? result.value.filter((group) => group.privacy === 'public') : []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { groups, loading };
}
