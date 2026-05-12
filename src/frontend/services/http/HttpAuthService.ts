import type { IAuthService } from '../types/IAuthService';
import type { Result } from '../types/index';
import { API_BASE_URL } from './config';

type BackendAuthPayload = {
  account_id: string;
  user_id: string;
  email: string;
  username: string;
  photo_url: string | null;
};

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

class HttpAuthService implements IAuthService {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

  async register(input: {
    email: string;
    username: string;
    password: string;
  }): Promise<Result<{ accountId: string; userId: string }>> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: input.email,
          username: input.username,
          password: input.password,
        }),
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      const detail = await readDetail(response);
      return { ok: false, error: mapRegisterError(response.status, detail) };
    }

    const payload = (await response.json()) as BackendAuthPayload;
    return {
      ok: true,
      value: { accountId: payload.account_id, userId: payload.user_id },
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
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: input.email, password: input.password }),
      });
    } catch {
      return { ok: false, error: { code: 'network' } };
    }

    if (!response.ok) {
      return { ok: false, error: mapLoginError(response.status) };
    }

    const payload = (await response.json()) as BackendAuthPayload;
    return {
      ok: true,
      value: { accountId: payload.account_id, userId: payload.user_id },
    };
  }

  async logout(): Promise<Result<void>> {
    return { ok: true, value: undefined };
  }
}

export const httpAuthService = new HttpAuthService();
