import { mockUploadService } from '../../../../src/frontend/services/mock/MockUploadService';

// In mock mode there is no backend, so the upload "echoes" the local file URI back as the
// photo URL. That lets a picked image preview immediately without a server round-trip, the
// same reducer-as-source-of-truth approach the other mock services use.
describe('MockUploadService', () => {
  it('echoes the local image URI back as the photo URL', async () => {
    const result = await mockUploadService.uploadImage({
      uri: 'file:///tmp/pick.png',
      mimeType: 'image/png',
      fileSize: 2048,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.url).toBe('file:///tmp/pick.png');
    expect(typeof result.value.key).toBe('string');
  });

  it('rejects an oversized image (client-side guard mirrors the backend 400)', async () => {
    const result = await mockUploadService.uploadImage({
      uri: 'file:///tmp/huge.png',
      mimeType: 'image/png',
      fileSize: 5 * 1024 * 1024 + 1,
    });
    expect(result.ok).toBe(false);
  });

  it('rejects an unsupported image type', async () => {
    const result = await mockUploadService.uploadImage({
      uri: 'file:///tmp/anim.gif',
      mimeType: 'image/gif',
      fileSize: 10,
    });
    expect(result.ok).toBe(false);
  });
});
