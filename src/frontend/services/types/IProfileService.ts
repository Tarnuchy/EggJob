import type { Result } from './index';

export interface UserStats {
  activeTasks: number;
  completedTasks: number;
  friendsCount: number;
}

export interface IProfileService {
  editProfile(
    userId: string,
    input: { username?: string; photoUrl?: string },
  ): Promise<Result<void>>;

  removeProfilePhoto(userId: string): Promise<Result<void>>;

  deleteAccount(accountId: string, userId: string): Promise<Result<void>>;

  getProfile(userId: string): Promise<Result<{ username: string; photoUrl?: string }>>;

  getUserStats(userId: string): Promise<Result<UserStats>>;
}
