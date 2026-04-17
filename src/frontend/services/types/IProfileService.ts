import type { Result } from "./index";

export interface IProfileService {
  editProfile(
    userId: string,
    input: { username?: string; photoUrl?: string }
  ): Promise<Result<void>>;

  deleteAccount(accountId: string, userId: string): Promise<Result<void>>;

  getProfile(userId: string): Promise<Result<{ username: string; photoUrl?: string }>>;
}