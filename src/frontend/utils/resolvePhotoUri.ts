import { API_BASE_URL } from '../services/http/config';

/**
 * Resolves a stored `photoUrl` into a URI that `<Image>` can load.
 *
 * The backend stores photos as relative paths (`/media/<key>.png`), so those must be prefixed
 * with the API base URL. Absolute remote URLs, local picker URIs (`file://`, `content://`) used
 * for an instant preview / mock mode, and data URIs are returned untouched.
 */
export function resolvePhotoUri(photoUrl?: string): string | undefined {
  if (!photoUrl) return undefined;
  const trimmed = photoUrl.trim();
  if (trimmed.length === 0) return undefined;

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return trimmed;
}
