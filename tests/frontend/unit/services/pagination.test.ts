import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PAGE_SIZE,
  fetchAllPages,
  hasMorePages,
  nextOffset,
  pageQueryString,
} from '../../../../src/frontend/services/pagination';
import type { Page, Result } from '../../../../src/frontend/services/types';

describe('pagination helpers', () => {
  it('DEFAULT_PAGE_SIZE matches the backend default', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
  });

  describe('hasMorePages', () => {
    it('is true while fewer than total items have been loaded', () => {
      expect(hasMorePages(0, 20, 50)).toBe(true);
      expect(hasMorePages(20, 20, 50)).toBe(true);
    });

    it('is false at the exact boundary', () => {
      expect(hasMorePages(40, 10, 50)).toBe(false);
      expect(hasMorePages(0, 20, 20)).toBe(false);
    });

    it('is false when there is nothing at all', () => {
      expect(hasMorePages(0, 0, 0)).toBe(false);
    });

    it('is false on an empty page even if total claims more (guards infinite loop)', () => {
      expect(hasMorePages(0, 0, 5)).toBe(false);
    });
  });

  describe('nextOffset', () => {
    it('advances the offset by the number of items just loaded', () => {
      expect(nextOffset(0, 20)).toBe(20);
      expect(nextOffset(20, 13)).toBe(33);
    });
  });

  describe('pageQueryString', () => {
    it('is empty when no options are given', () => {
      expect(pageQueryString()).toBe('');
      expect(pageQueryString({})).toBe('');
    });

    it('serialises limit and offset', () => {
      expect(pageQueryString({ limit: 20, offset: 0 })).toBe('?limit=20&offset=0');
    });

    it('includes only the provided params', () => {
      expect(pageQueryString({ offset: 40 })).toBe('?offset=40');
      expect(pageQueryString({ limit: 100 })).toBe('?limit=100');
    });
  });

  describe('fetchAllPages', () => {
    it('aggregates items across every page', async () => {
      const all = [0, 1, 2, 3, 4];
      const fetchPage = async (offset: number, limit: number): Promise<Result<Page<number>>> => ({
        ok: true,
        value: { items: all.slice(offset, offset + limit), total: all.length },
      });

      const result = await fetchAllPages(fetchPage, 2);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toEqual([0, 1, 2, 3, 4]);
    });

    it('returns a single page that fits in one request', async () => {
      const fetchPage = async (): Promise<Result<Page<string>>> => ({
        ok: true,
        value: { items: ['a', 'b'], total: 2 },
      });

      const result = await fetchAllPages(fetchPage, 20);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toEqual(['a', 'b']);
    });

    it('propagates an error from any page', async () => {
      const fetchPage = async (offset: number): Promise<Result<Page<number>>> =>
        offset === 0
          ? { ok: true, value: { items: [1, 2], total: 4 } }
          : { ok: false, error: { code: 'network' } };

      const result = await fetchAllPages(fetchPage, 2);
      expect(result.ok).toBe(false);
    });
  });
});
