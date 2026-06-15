/**
 * Client-side image guards mirroring the backend's `POST /uploads` contract
 * (max 5 MB, only jpeg/png/webp — otherwise the backend answers 400). Kept as a pure
 * module with no native imports so it can be unit-tested and reused by the picker,
 * the mock upload service and the HTTP upload service.
 */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type ImageValidationError = { code: 'too-large' | 'unsupported-type' };

export function validateImageAsset(asset: { mimeType?: string; fileSize?: number }): ImageValidationError | null {
  if (!asset.mimeType || !(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(asset.mimeType)) {
    return { code: 'unsupported-type' };
  }
  if (asset.fileSize !== undefined && asset.fileSize > MAX_IMAGE_SIZE_BYTES) {
    return { code: 'too-large' };
  }
  return null;
}
