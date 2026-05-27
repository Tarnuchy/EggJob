import { useEffect, useState } from 'react';
import { profileService } from '../services';
import type { UserStats } from '../services';

interface UseUserStatsResult {
  stats: UserStats | null;
  loading: boolean;
  error: boolean;
}

/** Loads a user's aggregate stats (active/completed tasks, friends, streak). */
export function useUserStats(userId: string): UseUserStatsResult {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    void (async () => {
      const result = await profileService.getUserStats(userId);
      if (cancelled) return;
      if (result.ok) {
        setStats(result.value);
      } else {
        setStats(null);
        setError(true);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { stats, loading, error };
}
