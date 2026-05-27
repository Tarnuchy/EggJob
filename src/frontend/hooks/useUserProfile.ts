import { useEffect, useState } from 'react';
import { profileService } from '../services';

export interface UserProfile {
  username: string;
  photoUrl?: string;
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: boolean;
}

/** Loads a user's public profile (username + optional avatar). */
export function useUserProfile(userId: string): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    void (async () => {
      const result = await profileService.getProfile(userId);
      if (cancelled) return;
      if (result.ok) {
        setProfile(result.value);
      } else {
        setProfile(null);
        setError(true);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, loading, error };
}
