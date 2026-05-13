import type { ReducerResult } from '../application/reducer';
import { strings } from '../i18n/strings';

type ReducerError = Extract<ReducerResult, { ok: false }>['error'];

const messages = strings.reducerErrors;

export function mapReducerError(error: ReducerError): string {
  switch (error.code) {
    case 'validation':
      if (error.field === 'email') return messages.validationEmail;
      if (error.field === 'username') return messages.validationUsername;
      if (error.field === 'name') return messages.validationName;
      if (error.field === 'inviteCode') return messages.validationInviteCode;
      if (error.field === 'value') return messages.validationValue;
      return messages.validationGeneric;
    case 'not-found':
      return messages.notFound;
    case 'unknown-action':
      return messages.unknownAction;
    default:
      return messages.unknown;
  }
}
