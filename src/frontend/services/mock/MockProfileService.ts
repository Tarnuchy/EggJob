import { isValidUsername } from '../../utils/validation';
import type { IProfileService, UserStats } from '../types/IProfileService';
import type { Result } from '../types/index';

class MockProfileService implements IProfileService {
  private profiles: Record<string, { username: string; photoUrl?: string }> = {
    'usr-seed-1': { username: 'alice', photoUrl: undefined },
    'usr-seed-2': { username: 'bob', photoUrl: undefined },
    'usr-seed-3': { username: 'charlie', photoUrl: undefined },
    'usr-seed-4': { username: 'dave', photoUrl: undefined },
    'usr-seed-5': { username: 'erin', photoUrl: undefined },
    'usr-seed-6': { username: 'frank', photoUrl: undefined },
  };

  private stats: Record<string, UserStats> = {
    'usr-seed-1': { activeTasks: 4, completedTasks: 12, friendsCount: 2 },
    'usr-seed-2': { activeTasks: 2, completedTasks: 5, friendsCount: 3 },
    'usr-seed-3': { activeTasks: 6, completedTasks: 1, friendsCount: 1 },
    'usr-seed-4': { activeTasks: 0, completedTasks: 8, friendsCount: 1 },
    'usr-seed-5': { activeTasks: 3, completedTasks: 9, friendsCount: 2 },
    'usr-seed-6': { activeTasks: 1, completedTasks: 0, friendsCount: 0 },
  };

  getAllProfiles(): Array<{ userId: string; username: string; photoUrl?: string }> {
    return Object.entries(this.profiles).map(([userId, profile]) => ({
      userId,
      username: profile.username,
      photoUrl: profile.photoUrl,
    }));
  }

  async editProfile(
    userId: string,
    input: { username?: string; photoUrl?: string },
  ): Promise<Result<void>> {
    if (input.username !== undefined && !isValidUsername(input.username)) {
      return { ok: false, error: { code: 'validation', field: 'username' } };
    }

    const profile = this.profiles[userId] ?? { username: 'unknown' };
    this.profiles[userId] = {
      ...profile,
      ...(input.username !== undefined ? { username: input.username } : {}),
      ...(input.photoUrl !== undefined ? { photoUrl: input.photoUrl } : {}),
    };

    return { ok: true, value: undefined };
  }

  async removeProfilePhoto(userId: string): Promise<Result<void>> {
    const profile = this.profiles[userId];
    if (profile) {
      this.profiles[userId] = { ...profile, photoUrl: undefined };
    }
    return { ok: true, value: undefined };
  }

  async deleteAccount(accountId: string, userId: string): Promise<Result<void>> {
    void accountId;
    delete this.profiles[userId];
    delete this.stats[userId];
    return { ok: true, value: undefined };
  }

  async getProfile(userId: string): Promise<Result<{ username: string; photoUrl?: string }>> {
    const profile = this.profiles[userId];
    if (!profile) {
      return { ok: false, error: { code: 'not-found' } };
    }
    return { ok: true, value: profile };
  }

  async getUserStats(userId: string): Promise<Result<UserStats>> {
    if (!this.profiles[userId]) {
      return { ok: false, error: { code: 'not-found' } };
    }
    const stats = this.stats[userId] ?? {
      activeTasks: 0,
      completedTasks: 0,
      friendsCount: 0,
    };
    return { ok: true, value: stats };
  }
}

export const mockProfileService = new MockProfileService();
export { MockProfileService };
