import type { IAuthService } from '../types/IAuthService';
import type { Result } from '../types/index';
import { AuthTokenStorage } from './AuthTokenStorage';
import { API_BASE_URL } from './config';
import { mapBackendAuthPayload } from './mappers/mapBackendAuthPayload';
import type { BackendAuthPayload } from './mappers/mapBackendAuthPayload';

type BackendErrorBody = { detail?: unknown };

function mapRegisterError(status: number, detail: string): { code: string; field?: string } {
  const lower = detail.toLowerCase();

  if (status === 400) {
    if (lower.includes('email')) return { code: 'validation', field: 'email' };
    if (lower.includes('password')) return { code: 'validation', field: 'password' };
    return { code: 'validation' };
  }
  if (status === 409) {
    if (lower.includes('email')) return { code: 'conflict', field: 'email' };
    if (lower.includes('username')) return { code: 'conflict', field: 'username' };
    return { code: 'conflict' };
  }
  return { code: `http-${status}` };
}

function mapLoginError(status: number): { code: string; field?: string } {
  if (status === 404) return { code: 'not-found' };
  if (status === 401) return { code: 'unauthorized' };
  if (status === 400) return { code: 'validation' };
  return { code: `http-${status}` };
}

async function readDetail(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as BackendErrorBody;
    if (typeof body?.detail === 'string') return body.detail;
    if (body?.detail !== null && body?.detail !== undefined) return JSON.stringify(body.detail);
  } catch {
    // not JSON
  }
  return '';
}

const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };

export class HttpAuthService implements IAuthService {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

  async register(input: {
    email: string;
    username: string;
    password: string;
    photoUrl?: string;
  }): Promise<Result<{ accountId: string; userId: string }>> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({
          email: input.email,
          username: input.username,
          password: input.password,
          ...(input.photoUrl !== undefined ? { photo_url: input.photoUrl } : {}),
        }),
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      const detail = await readDetail(response);
      return { ok: false, error: mapRegisterError(response.status, detail) };
    }

    const parsed = mapBackendAuthPayload((await response.json()) as BackendAuthPayload);
    if (parsed.accessToken) {
      await AuthTokenStorage.setToken(parsed.accessToken);
    }
    return {
      ok: true,
      value: { accountId: parsed.accountId, userId: parsed.userId },
    };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<Result<{ accountId: string; userId: string }>> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(input),
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      return { ok: false, error: mapLoginError(response.status) };
    }

    const parsed = mapBackendAuthPayload((await response.json()) as BackendAuthPayload);
    if (parsed.accessToken) {
      await AuthTokenStorage.setToken(parsed.accessToken);
    }
    return {
      ok: true,
      value: { accountId: parsed.accountId, userId: parsed.userId },
    };
  }

  async logout(): Promise<Result<void>> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: JSON_HEADERS,
      });
    } catch {
      // token will still be cleared locally
    }
    await AuthTokenStorage.clearToken();
    return { ok: true, value: undefined };
  }
}

export const httpAuthService = new HttpAuthService();
