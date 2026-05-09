import {
    isValidEmail,
    isValidPassword,
    isValidUsername,
    passwordsMatch,
} from './validation';

export const getEmailError = (v: string): string =>
    !v.trim() ? 'Email is required.' : '';

export const getPasswordError = (v: string): string =>
    !v.trim() ? 'Password is required.' : '';

export const getRegEmailError = (v: string): string =>
    !isValidEmail(v.trim()) ? 'Please enter a valid email address.' : '';

export const getRegUsernameError = (v: string): string =>
    !isValidUsername(v.trim()) ? 'At least 3 characters.' : '';

export const getRegPasswordError = (v: string): string =>
    !isValidPassword(v) ? 'At least 8 characters.' : '';

export const getRegConfirmError = (v: string, pw: string): string => {
    if (!v.trim()) return 'Please confirm your password.';
    if (!passwordsMatch(pw, v)) return 'Passwords do not match.';
    return '';
};

export const shouldValidateOnBlur = (v: string): boolean =>
    v.trim().length > 0;

export const shouldValidatePasswordOnBlur = (v: string): boolean =>
    v.length > 0;
