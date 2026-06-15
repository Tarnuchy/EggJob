import type { TFunction } from 'i18next';

/** Maps a photo pick/upload error code to a user-facing, localized message. */
export function getPhotoErrorMessage(t: TFunction, code: string): string {
  switch (code) {
    case 'permission-denied':
      return t('photo.errors.permissionDenied');
    case 'too-large':
      return t('photo.errors.tooLarge');
    case 'unsupported-type':
      return t('photo.errors.unsupportedType');
    case 'unauthorized':
      // Retrying will not help — the session is gone, so steer the user to sign in again.
      return t('photo.errors.unauthorized');
    case 'validation':
      // Server rejected the bytes (size/format) even though the client guard passed.
      return t('photo.errors.invalid');
    default:
      return t('photo.errors.uploadFailed');
  }
}
