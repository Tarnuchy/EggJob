import {
  validateImageAsset,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
} from '../../../../src/frontend/utils/imageValidation';

describe('validateImageAsset', () => {
  it('accepts a jpeg/png/webp within the size limit', () => {
    expect(validateImageAsset({ mimeType: 'image/jpeg', fileSize: 1024 })).toBeNull();
    expect(validateImageAsset({ mimeType: 'image/png', fileSize: 1024 })).toBeNull();
    expect(validateImageAsset({ mimeType: 'image/webp', fileSize: 1024 })).toBeNull();
  });

  it('exposes the 5 MB limit and the allowed mime types', () => {
    expect(MAX_IMAGE_SIZE_BYTES).toBe(5 * 1024 * 1024);
    expect(ALLOWED_IMAGE_MIME_TYPES).toEqual(['image/jpeg', 'image/png', 'image/webp']);
  });

  it('rejects files larger than the limit', () => {
    expect(validateImageAsset({ mimeType: 'image/png', fileSize: MAX_IMAGE_SIZE_BYTES + 1 })).toEqual({
      code: 'too-large',
    });
  });

  it('rejects unsupported mime types', () => {
    expect(validateImageAsset({ mimeType: 'image/gif', fileSize: 10 })).toEqual({
      code: 'unsupported-type',
    });
  });

  it('rejects assets whose mime type is unknown (cannot set Content-Type safely)', () => {
    expect(validateImageAsset({ fileSize: 10 })).toEqual({ code: 'unsupported-type' });
  });

  it('accepts assets with an allowed type but unknown size (backend enforces the limit too)', () => {
    expect(validateImageAsset({ mimeType: 'image/jpeg' })).toBeNull();
  });
});
