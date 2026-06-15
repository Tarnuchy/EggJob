import { useCallback, useState } from 'react';
import { uploadService } from '../services';
import { pickImage, type PickSource } from '../utils/pickImage';

export type PhotoUploadOutcome =
  | { status: 'uploaded'; url: string }
  | { status: 'canceled' }
  | { status: 'error'; code: string };

/**
 * Shared pick → upload flow used by the profile, progress and registration screens.
 * Returns a discriminated outcome (uploaded / canceled / error) plus an `uploading` flag so
 * the caller can show a spinner. The resulting URL is whatever the upload service returns:
 * a relative `/media/…` path from the backend, or the local URI in mock mode.
 */
export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = useCallback(async (source: PickSource): Promise<PhotoUploadOutcome> => {
    const picked = await pickImage(source);
    if (picked.status === 'canceled') return { status: 'canceled' };
    if (picked.status === 'error') return { status: 'error', code: picked.code };

    setUploading(true);
    try {
      const result = await uploadService.uploadImage(picked.image);
      if (!result.ok) return { status: 'error', code: result.error.code };
      return { status: 'uploaded', url: result.value.url };
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploading, pickAndUpload };
}
