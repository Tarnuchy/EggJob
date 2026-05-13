import { AuthTokenStorage } from './AuthTokenStorage';

export async function buildAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const token = await AuthTokenStorage.getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
