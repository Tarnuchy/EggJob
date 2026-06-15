import type { TFunction } from 'i18next';
import { getPhotoErrorMessage } from '../../../../src/frontend/utils/getPhotoErrorMessage';

// Identity translator: returns the i18n key, so we assert which key each code maps to.
const t = ((key: string) => key) as unknown as TFunction;

describe('getPhotoErrorMessage', () => {
  it('maps each known error code to its dedicated message key', () => {
    expect(getPhotoErrorMessage(t, 'permission-denied')).toBe('photo.errors.permissionDenied');
    expect(getPhotoErrorMessage(t, 'too-large')).toBe('photo.errors.tooLarge');
    expect(getPhotoErrorMessage(t, 'unsupported-type')).toBe('photo.errors.unsupportedType');
    expect(getPhotoErrorMessage(t, 'unauthorized')).toBe('photo.errors.unauthorized');
    expect(getPhotoErrorMessage(t, 'validation')).toBe('photo.errors.invalid');
  });

  it('falls back to the generic message for unknown/network codes', () => {
    expect(getPhotoErrorMessage(t, 'network')).toBe('photo.errors.uploadFailed');
    expect(getPhotoErrorMessage(t, 'invalid-response')).toBe('photo.errors.uploadFailed');
    expect(getPhotoErrorMessage(t, 'http-500')).toBe('photo.errors.uploadFailed');
  });
});
