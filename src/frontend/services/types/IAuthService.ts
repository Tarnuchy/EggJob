import type { Result } from "./index";

export interface IAuthService {
  register(input: {
    email: string;
    username: string;
    password: string;
  }): Promise<Result<{ accountId: string; userId: string }>>;

  login(input: {
    email: string;
    password: string;
  }): Promise<Result<{ accountId: string; userId: string }>>;

  logout(): Promise<Result<void>>;
}