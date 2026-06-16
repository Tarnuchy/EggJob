import { useCallback, useEffect, useState } from 'react';
import { profileService, socialService } from '../../services';
import type { FeedItem, UserStats } from '../../services';

export const HOME_FEED_LIMIT = 20;

export interface HomeData {
  username: string | null;
  stats: UserStats | null;
  feed: FeedItem[];
  pendingInvitations: number;
  loading: boolean;
  error: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

/**
 * Aggregates the async parts of Home (profile, stats, feed, pending friend invitations)
 * into one loading/refresh surface. Reuses existing services — no new endpoints.
 */
export function useHomeData(userId: string): HomeData {
  const [username, setUsername] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [profileRes, statsRes, feedRes, invitesRes] = await Promise.all([
      profileService.getProfile(userId),
      profileService.getUserStats(userId),
      socialService.getUserFeed(userId),
      socialService.getPendingInvitations(userId),
    ]);
    let failed = false;
    if (profileRes.ok) setUsername(profileRes.value.username);
    else failed = true;
    if (statsRes.ok) setStats(statsRes.value);
    else {
      setStats(null);
      failed = true;
    }
    if (feedRes.ok) setFeed(feedRes.value.slice(0, HOME_FEED_LIMIT));
    else {
      setFeed([]);
      failed = true;
    }
    if (invitesRes.ok) setPendingInvitations(invitesRes.value.length);
    else {
      setPendingInvitations(0);
      failed = true;
    }
    setError(failed);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    void (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { username, stats, feed, pendingInvitations, loading, error, refreshing, refresh };
}
