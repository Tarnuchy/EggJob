import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { profileService } from '../../../services';
import { useCurrentUserId } from '../../../hooks/useCurrentUserId';
import { getRegUsernameError } from '../../../utils/authValidation';
import { isValidPhotoUrl } from '../../../utils/validation';

interface UseEditProfileFormOptions {
  onSuccess: () => void;
}

export function useEditProfileForm({ onSuccess }: UseEditProfileFormOptions) {
  const { t } = useTranslation();
  const currentUserId = useCurrentUserId();

  const [username, setUsername] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [photoTouched, setPhotoTouched] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [formError, setFormError] = useState('');
  const [shakeCount, setShakeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handlePhotoUrlChange = (value: string) => {
    setPhotoUrl(value);
    if (photoError) setPhotoError('');
    if (formError) setFormError('');
  };

  const handleUsernameBlur = () => {
    setUsernameTouched(true);
    setUsernameError(getRegUsernameError(t, username));
  };

  const validatePhoto = (): string => {
    const trimmed = photoUrl.trim();
    if (trimmed.length === 0) return '';
    return isValidPhotoUrl(trimmed) ? '' : t('profile.edit.photoInvalid');
  };

  const handlePhotoUrlBlur = () => {
    setPhotoTouched(true);
    setPhotoError(validatePhoto());
  };

  const resetShake = () => setShakeCount(0);

  const handleSubmit = async () => {
    setUsernameTouched(true);
    setPhotoTouched(true);
    const uErr = getRegUsernameError(t, username);
    const pErr = validatePhoto();
    setUsernameError(uErr);
    setPhotoError(pErr);
    if (uErr || pErr) {
      setShakeCount((c) => c + 1);
      return;
    }

    setIsSaving(true);
    try {
      const result = await profileService.editProfile(currentUserId, {
        username: username.trim(),
        photoUrl: photoUrl.trim(),
      });
      if (!result.ok) {
        setFormError(t('profile.edit.saveError'));
        setShakeCount((c) => c + 1);
        return;
      }
      onSuccess();
    } finally {
      setIsSaving(false);
    }
  };

  return {
    username,
    photoUrl,
    usernameTouched,
    photoTouched,
    usernameError,
    photoError,
    formError,
    shakeCount,
    loading,
    loadError,
    isSaving,
    handleUsernameChange,
    handlePhotoUrlChange,
    handleUsernameBlur,
    handlePhotoUrlBlur,
    handleSubmit,
    resetShake,
  };
}
