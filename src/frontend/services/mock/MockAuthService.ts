import { isValidEmail, isValidUsername } from "../../utils/validation";
import type { IAuthService } from "../types/IAuthService";
import type { Result } from "../types/index";

type SeedAccount = {
  accountId: string;
  userId: string;
  email: string;
  username: string;
  passwordHash: string;
};

class MockAuthService implements IAuthService {
  private accounts: SeedAccount[] = [
    {
      accountId: "acc-seed-1",
      userId: "usr-seed-1",
      email: "alice@example.com",
      username: "alice",
      passwordHash: "seed-hash-alice",
    },
  ];

  async register(input: {
    email: string;
    username: string;
    password: string;
  }): Promise<Result<{ accountId: string; userId: string }>> {
    if (!isValidEmail(input.email)) {
      return { ok: false, error: { code: "validation", field: "email" } };
    }
    if (!isValidUsername(input.username)) {
      return { ok: false, error: { code: "validation", field: "username" } };
    }

    const accountId = `acc-${Date.now()}`;
    const userId = `usr-${Date.now()}`;

    this.accounts.push({
      accountId,
      userId,
      email: input.email,
      username: input.username,
      passwordHash: `hash-${input.password}`,
    });

    return { ok: true, value: { accountId, userId } };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<Result<{ accountId: string; userId: string }>> {
    const account = this.accounts.find((entry) => entry.email === input.email);
    if (!account) {
      return { ok: false, error: { code: "not-found" } };
    }

    return {
      ok: true,
      value: { accountId: account.accountId, userId: account.userId },
    };
  }

  async logout(): Promise<Result<void>> {
    return { ok: true, value: undefined };
  }
}

export const mockAuthService = new MockAuthService();