import type { ReducerResult } from '../application/reducer';

type ReducerError = Extract<ReducerResult, { ok: false }>['error'];

export function mapReducerError(error: ReducerError): string {
  switch (error.code) {
    case 'validation':
      if (error.field === 'email') return 'Invalid email address.';
      if (error.field === 'username') return 'Invalid username.';
      if (error.field === 'name') return 'Name cannot be empty.';
      if (error.field === 'inviteCode') return 'Invalid invite code.';
      if (error.field === 'value') return 'Invalid value.';
      return 'Validation failed.';
    case 'not-found':
      return 'Resource not found.';
    case 'unknown-action':
      return 'Unknown action.';
    default:
      return 'Something went wrong.';
  }
}
