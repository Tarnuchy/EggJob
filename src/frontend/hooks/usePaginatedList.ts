import { useCallback, useEffect, useRef, useState } from 'react';
import type { Page, Result } from '../services/types';
import { DEFAULT_PAGE_SIZE, hasMorePages } from '../services/pagination';

interface UsePaginatedListResult<T> {
  items: T[];
  /** Initial page load (or a refresh) is in flight. */
  loading: boolean;
  /** A subsequent page is being appended. */
  loadingMore: boolean;
  /** The initial load failed. */
  error: boolean;
  hasMore: boolean;
  /** Appends the next page; no-op while a load is in flight or no more pages remain. */
  loadMore: () => void;
  /** Reloads from the first page. */
  refresh: () => Promise<void>;
  /** Applies a local transform to the loaded items (e.g. optimistic updates). */
  mutateItems: (updater: (prev: T[]) => T[]) => void;
}

/**
 * Drives an offset-paginated list backed by a `fetchPage(offset, limit)` source.
 * `fetchPage` must be stable (wrap it in `useCallback`) — its identity is the reload trigger.
 */
export function usePaginatedList<T>(
  fetchPage: (offset: number, limit: number) => Promise<Result<Page<T>>>,
  pageSize: number = DEFAULT_PAGE_SIZE,
): UsePaginatedListResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);
  const inFlightRef = useRef(false);

  const load = useCallback(
    async (mode: 'initial' | 'more') => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      const offset = mode === 'initial' ? 0 : offsetRef.current;
      if (mode === 'initial') {
        setLoading(true);
        setError(false);
      } else {
        setLoadingMore(true);
      }

      const result = await fetchPage(offset, pageSize);
      if (result.ok) {
        const page = result.value;
        setItems((prev) => (mode === 'initial' ? page.items : [...prev, ...page.items]));
        offsetRef.current = offset + page.items.length;
        setHasMore(hasMorePages(offset, page.items.length, page.total));
      } else if (mode === 'initial') {
        setItems([]);
        setHasMore(false);
        setError(true);
      }
      // a failed 'more' keeps the current items and hasMore so the user can retry by scrolling

      if (mode === 'initial') setLoading(false);
      else setLoadingMore(false);
      inFlightRef.current = false;
    },
    [fetchPage, pageSize],
  );

  useEffect(() => {
    void load('initial');
  }, [load]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    void load('more');
  }, [load, loading, loadingMore, hasMore]);

  const refresh = useCallback(() => load('initial'), [load]);

  const mutateItems = useCallback((updater: (prev: T[]) => T[]) => setItems(updater), []);

  return { items, loading, loadingMore, error, hasMore, loadMore, refresh, mutateItems };
}
