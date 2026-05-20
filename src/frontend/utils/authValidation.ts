import type { TFunction } from 'i18next';
import { isValidEmail, isValidUsername, passwordsMatch } from './validation';

export const getEmailError = (t: TFunction, v: string): string =>
  !v.trim() ? t('auth.errors.emailRequired') : '';

export const getPasswordError = (t: TFunction, v: string): string =>
  !v.trim() ? t('auth.errors.passwordRequired') : '';

export const getRegEmailError = (t: TFunction, v: string): string =>
  !isValidEmail(v.trim()) ? t('auth.errors.emailInvalid') : '';

export const getRegUsernameError = (t: TFunction, v: string): string => {
  const trimmed = v.trim();
  if (trimmed.length < 3) return t('auth.errors.usernameTooShort');
  if (trimmed.length > 24) return t('auth.errors.usernameTooLong');
  if (!isValidUsername(trimmed)) return t('auth.errors.usernameInvalidChars');
  return '';
};

export const getRegPasswordError = (t: TFunction, v: string): string => {
  if (v.length < 8) return t('auth.errors.passwordTooShort');
  if (!/[A-Z]/.test(v)) return t('auth.errors.passwordNeedsUppercase');
  if (!/[0-9]/.test(v)) return t('auth.errors.passwordNeedsDigit');
  return '';
};

export const getRegConfirmError = (t: TFunction, v: string, pw: string): string => {
  if (!v.trim()) return t('auth.errors.confirmRequired');
  if (!passwordsMatch(pw, v)) return t('auth.errors.passwordsDoNotMatch');
  return '';
};

export const shouldValidateOnBlur = (v: string): boolean => v.trim().length > 0;

export const shouldValidatePasswordOnBlur = (v: string): boolean => v.length > 0;
