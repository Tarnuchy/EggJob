import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';
import { validateImageAsset } from '../../utils/imageValidation';
import type { IUploadService, UploadableImage } from '../types/IUploadService';
import type { Result } from '../types/index';
import { API_BASE_URL } from './config';
import { AuthTokenStorage } from './AuthTokenStorage';

function mapStatus(status: number): { code: string } {
  if (status === 400) return { code: 'validation' };
  if (status === 401) return { code: 'unauthorized' };
  if (status === 413) return { code: 'too-large' };
  return { code: `http-${status}` };
}

/**
 * Uploads raw image bytes to `POST /uploads`. The backend expects the bytes directly in the
 * request body (NOT multipart) with a `Content-Type` header, so we use expo-file-system's
 * binary upload, which streams the file from disk without loading it into JS memory.
 */
export class HttpUploadService implements IUploadService {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

  async uploadImage(image: UploadableImage): Promise<Result<{ key: string; url: string }>> {
    const validationError = validateImageAsset(image);
    if (validationError) {
      return { ok: false, error: { code: validationError.code } };
    }

    try {
      const token = await AuthTokenStorage.getToken();
      const headers: Record<string, string> = {
        'Content-Type': image.mimeType,
        Accept: 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await uploadAsync(`${this.baseUrl}/uploads`, image.uri, {
        httpMethod: 'POST',
        uploadType: FileSystemUploadType.BINARY_CONTENT,
        headers,
      });

      if (response.status < 200 || response.status >= 300) {
        return { ok: false, error: mapStatus(response.status) };
      }

      let parsed: { key?: string; url?: string };
      try {
        parsed = JSON.parse(response.body) as { key?: string; url?: string };
      } catch {
        return { ok: false, error: { code: 'invalid-response' } };
      }
      if (!parsed.url) {
        return { ok: false, error: { code: 'invalid-response' } };
      }
      return { ok: true, value: { key: parsed.key ?? '', url: parsed.url } };
    } catch {
      return { ok: false, error: { code: 'network' } };
    }
  }
}

export const httpUploadService = new HttpUploadService();
