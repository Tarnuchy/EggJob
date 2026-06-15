import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { profileService } from '../../../services';
import { useAppState } from '../../../application/AppStateContext';
import { useCurrentUserId } from '../../../hooks/useCurrentUserId';
import { usePhotoUpload } from '../../../hooks/usePhotoUpload';
import { getRegUsernameError } from '../../../utils/authValidation';
import { getPhotoErrorMessage } from '../../../utils/getPhotoErrorMessage';
import { afterInteractions } from '../../../utils/afterInteractions';
import type { PickSource } from '../../../utils/pickImage';

interface UseEditProfileFormOptions {
  onSuccess: () => void;
}

export function useEditProfileForm({ onSuccess }: UseEditProfileFormOptions) {
  const { t } = useTranslation();
  const { dispatch } = useAppState();
  const currentUserId = useCurrentUserId();
  const { uploading, pickAndUpload } = usePhotoUpload();

  const [username, setUsername] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [formError, setFormError] = useState('');
  const [shakeCount, setShakeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await profileService.getProfile(currentUserId);
      if (cancelled) return;
      if (result.ok) {
        setUsername(result.value.username);
        setPhotoUrl(result.value.photoUrl ?? '');
      } else {
        setLoadError(true);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (usernameError) setUsernameError('');
    if (formError) setFormError('');
  };

  const handleUsernameBlur = () => {
    setUsernameTouched(true);
    setUsernameError(getRegUsernameError(t, username));
  };

  const openPhotoSheet = () => setSheetVisible(true);
  const closePhotoSheet = () => setSheetVisible(false);

  const handleSelectSource = async (source: PickSource) => {
    setSheetVisible(false);
    await afterInteractions();
    const outcome = await pickAndUpload(source);
    if (outcome.status === 'uploaded') {
      setPhotoUrl(outcome.url);
      if (formError) setFormError('');
    } else if (outcome.status === 'error') {
      setFormError(getPhotoErrorMessage(t, outcome.code));
      setShakeCount((c) => c + 1);
    }
  };

  const handleRemovePhoto = async () => {
    const res = await profileService.removeProfilePhoto(currentUserId);
    if (!res.ok) {
      setFormError(t('profile.edit.saveError'));
      setShakeCount((c) => c + 1);
      return;
    }
    setPhotoUrl('');
    if (formError) setFormError('');
    // Best-effort reducer sync (the backend already cleared it; a logged-in user may not be cached).
    dispatch({ type: 'profile/edit', userId: currentUserId, photoUrl: '' });
  };

  const resetShake = () => setShakeCount(0);

  const handleSubmit = async () => {
    setUsernameTouched(true);
    const uErr = getRegUsernameError(t, username);
    setUsernameError(uErr);
    if (uErr) {
      setShakeCount((c) => c + 1);
      return;
    }

    setIsSaving(true);
    try {
      const trimmedUsername = username.trim();
      const nextPhotoUrl = photoUrl.trim() || undefined;
      const result = await profileService.editProfile(currentUserId, {
        username: trimmedUsername,
        photoUrl: nextPhotoUrl,
      });
      if (!result.ok) {
        setFormError(t('profile.edit.saveError'));
        setShakeCount((c) => c + 1);
        return;
      }
      // Keep the reducer's user cache in sync so member lists (e.g. group screens) reflect the
      // edit without a reload. Best-effort: a logged-in user may not be in the local cache yet,
      // and that is not a save failure — the service is the source of truth for persistence.
      dispatch({
        type: 'profile/edit',
        userId: currentUserId,
        username: trimmedUsername,
        photoUrl: nextPhotoUrl,
      });
      onSuccess();
    } finally {
      setIsSaving(false);
    }
  };

  return {
    username,
    photoUrl,
    usernameTouched,
    usernameError,
    formError,
    shakeCount,
    loading,
    loadError,
    isSaving,
    uploading,
    sheetVisible,
    handleUsernameChange,
    handleUsernameBlur,
    openPhotoSheet,
    closePhotoSheet,
    handleSelectSource,
    handleRemovePhoto,
    handleSubmit,
    resetShake,
  };
}
