import { validateImageAsset } from '../../utils/imageValidation';
import type { IUploadService, UploadableImage } from '../types/IUploadService';
import type { Result } from '../types/index';

/**
 * Mock upload: there is no backend, so the local file URI is echoed back as the photo URL.
 * The picked image therefore previews immediately and round-trips through state unchanged —
 * consistent with the other mock services treating the reducer as the source of truth.
 * The same client-side guards as the real upload are applied so validation behaviour matches.
 */
class MockUploadService implements IUploadService {
  private counter = 0;

  async uploadImage(image: UploadableImage): Promise<Result<{ key: string; url: string }>> {
    const validationError = validateImageAsset(image);
    if (validationError) {
      return { ok: false, error: { code: validationError.code } };
    }
    this.counter += 1;
    return { ok: true, value: { key: `mock-upload-${this.counter}`, url: image.uri } };
  }
}

export const mockUploadService = new MockUploadService();
export { MockUploadService };
