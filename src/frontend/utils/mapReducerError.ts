import type { TFunction } from 'i18next';
import type { ReducerResult } from '../application/reducer';

type ReducerError = Extract<ReducerResult, { ok: false }>['error'];

export function mapReducerError(t: TFunction, error: ReducerError): string {
  switch (error.code) {
    case 'validation':
      if (error.field === 'email') return t('reducerErrors.validationEmail');
      if (error.field === 'username') return t('reducerErrors.validationUsername');
      if (error.field === 'name') return t('reducerErrors.validationName');
      if (error.field === 'inviteCode') return t('reducerErrors.validationInviteCode');
      if (error.field === 'value') return t('reducerErrors.validationValue');
      return t('reducerErrors.validationGeneric');
    case 'not-found':
      return t('reducerErrors.notFound');
    case 'unknown-action':
      return t('reducerErrors.unknownAction');
    default:
      return t('reducerErrors.unknown');
  }
}
