/**
 * Pure pagination math shared by the paginated lists (friends, notifications).
 * No React/React Native imports — testable in the `node` test env.
 *
 * Backend pages are offset-based: a request at `offset` returns up to `limit` items
 * plus the collection `total`. Loaded-so-far count after a page is `offset + items.length`.
 */
import type { Page, PageOptions, Result } from './types';

/** Backend default page size for the paginated list endpoints. */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Whether another page can be fetched after loading `pageLength` items at `offset`.
 * An empty page returns `false` even if `total` claims more, so callers never loop forever.
 */
export function hasMorePages(offset: number, pageLength: number, total: number): boolean {
  if (pageLength <= 0) return false;
  return offset + pageLength < total;
}

/** Offset for the next page after loading `pageLength` items at `offset`. */
export function nextOffset(offset: number, pageLength: number): number {
  return offset + pageLength;
}

/** Builds the `?limit=&offset=` query suffix, including only the params that are set. */
export function pageQueryString(opts?: PageOptions): string {
  const params: string[] = [];
  if (opts?.limit !== undefined) params.push(`limit=${opts.limit}`);
  if (opts?.offset !== undefined) params.push(`offset=${opts.offset}`);
  return params.length > 0 ? `?${params.join('&')}` : '';
}

/**
 * Walks every page of a paginated source and returns the flattened items.
 * Short-circuits and propagates the first error. Used where the complete set is
 * required regardless of page size (relationship checks, mark-all-as-read).
 */
export async function fetchAllPages<T>(
  fetchPage: (offset: number, limit: number) => Promise<Result<Page<T>>>,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<Result<T[]>> {
  const all: T[] = [];
  let offset = 0;
  for (;;) {
    const page = await fetchPage(offset, pageSize);
    if (!page.ok) return { ok: false, error: page.error };
    all.push(...page.value.items);
    if (!hasMorePages(offset, page.value.items.length, page.value.total)) break;
    offset = nextOffset(offset, page.value.items.length);
  }
  return { ok: true, value: all };
}
