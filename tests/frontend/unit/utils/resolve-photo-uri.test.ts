import { resolvePhotoUri } from '../../../../src/frontend/utils/resolvePhotoUri';
import { API_BASE_URL } from '../../../../src/frontend/services/http/config';

describe('resolvePhotoUri', () => {
  it('returns undefined for empty or missing values', () => {
    expect(resolvePhotoUri(undefined)).toBeUndefined();
    expect(resolvePhotoUri('')).toBeUndefined();
    expect(resolvePhotoUri('   ')).toBeUndefined();
  });

  it('prefixes the API base URL for backend-relative /media paths', () => {
    expect(resolvePhotoUri('/media/abc.png')).toBe(`${API_BASE_URL}/media/abc.png`);
  });

  it('leaves absolute https URLs unchanged', () => {
    const url = 'https://cdn.example.com/avatar.jpg';
    expect(resolvePhotoUri(url)).toBe(url);
  });

  it('leaves local file and content URIs unchanged (mock / pre-upload preview)', () => {
    expect(resolvePhotoUri('file:///tmp/pick.jpg')).toBe('file:///tmp/pick.jpg');
    expect(resolvePhotoUri('content://media/123')).toBe('content://media/123');
  });

  it('leaves data URIs unchanged', () => {
    const data = 'data:image/png;base64,AAAA';
    expect(resolvePhotoUri(data)).toBe(data);
  });
});
