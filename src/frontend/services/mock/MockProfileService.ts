import { isValidUsername } from '../../utils/validation';
import type { IProfileService } from '../types/IProfileService';
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

  async deleteAccount(accountId: string, userId: string): Promise<Result<void>> {
    void accountId;
    delete this.profiles[userId];
    return { ok: true, value: undefined };
  }

  async getProfile(userId: string): Promise<Result<{ username: string; photoUrl?: string }>> {
    const profile = this.profiles[userId];
    if (!profile) {
      return { ok: false, error: { code: 'not-found' } };
    }
    return { ok: true, value: profile };
  }
}

export const mockProfileService = new MockProfileService();
