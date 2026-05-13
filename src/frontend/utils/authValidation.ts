import { strings } from '../i18n/strings';
import { isValidEmail, isValidPassword, isValidUsername, passwordsMatch } from './validation';

const errs = strings.auth.errors;

export const getEmailError = (v: string): string => (!v.trim() ? errs.emailRequired : '');

export const getPasswordError = (v: string): string => (!v.trim() ? errs.passwordRequired : '');

export const getRegEmailError = (v: string): string =>
  !isValidEmail(v.trim()) ? errs.emailInvalid : '';

export const getRegUsernameError = (v: string): string => {
  const trimmed = v.trim();
  if (trimmed.length < 3) return errs.usernameTooShort;
  if (trimmed.length > 24) return errs.usernameTooLong;
  if (!isValidUsername(trimmed)) return errs.usernameInvalidChars;
  return '';
};

export const getRegPasswordError = (v: string): string =>
  !isValidPassword(v) ? errs.passwordTooShort : '';

export const getRegConfirmError = (v: string, pw: string): string => {
  if (!v.trim()) return errs.confirmRequired;
  if (!passwordsMatch(pw, v)) return errs.passwordsDoNotMatch;
  return '';
};

export const shouldValidateOnBlur = (v: string): boolean => v.trim().length > 0;

export const shouldValidatePasswordOnBlur = (v: string): boolean => v.length > 0;
