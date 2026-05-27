import { useEffect, useState } from 'react';
import { socialService } from '../../../services';
import type { FeedItem } from '../../../services';
import { useCurrentUserId } from '../../../hooks/useCurrentUserId';

interface UseFriendActivityResult {
  items: FeedItem[];
  loading: boolean;
}

/**
 * Recent activity of `targetUserId`, taken from the current user's feed and
 * filtered to that person. Empty when they share no groups with the viewer.
 */
export function useFriendActivity(targetUserId: string): UseFriendActivityResult {
  const currentUserId = useCurrentUserId();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const result = await socialService.getUserFeed(currentUserId);
      if (cancelled) return;
      setItems(
        result.ok ? result.value.filter((item) => item.userId === targetUserId) : [],
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUserId, targetUserId]);

  return { items, loading };
}
