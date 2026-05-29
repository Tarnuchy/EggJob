import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { describeRelativeTime } from '../utils/relativeTime';

/**
 * Returns a formatter that maps an ISO timestamp to localized relative-time
 * copy (e.g. "3 h ago"), re-bound whenever the active language changes.
 */
export function useRelativeTime(): (isoDate: string) => string {
  const { t } = useTranslation();

  return useCallback(
    (isoDate: string) => {
      const { unit, count } = describeRelativeTime(new Date(isoDate).getTime(), Date.now());
      switch (unit) {
        case 'minutes':
          return t('relativeTime.minutes', { count });
        case 'hours':
          return t('relativeTime.hours', { count });
        case 'days':
          return t('relativeTime.days', { count });
        case 'weeks':
          return t('relativeTime.weeks', { count });
        case 'now':
        default:
          return t('relativeTime.now');
      }
    },
    [t],
  );
}
