import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../../application/AppStateContext';
import { authService, profileService, uploadService } from '../../../services';
import {
  getRegConfirmError,
  getRegEmailError,
  getRegPasswordError,
  getRegUsernameError,
  shouldValidateOnBlur,
  shouldValidatePasswordOnBlur,
} from '../../../utils/authValidation';
import { getPhotoErrorMessage } from '../../../utils/getPhotoErrorMessage';
import { afterInteractions } from '../../../utils/afterInteractions';
import { mapReducerError } from '../../../utils/mapReducerError';
import { pickImage, type PickSource } from '../../../utils/pickImage';
import type { UploadableImage } from '../../../services/types/IUploadService';

interface UseRegisterFormOptions {
  onSuccess: () => void;
}

export function useRegisterForm({ onSuccess }: UseRegisterFormOptions) {
  const { dispatch } = useAppState();
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  // Local preview URI of the picked avatar; the actual upload is deferred until after
  // registration, because POST /uploads needs the bearer token that register() returns.
  const [photoUrl, setPhotoUrl] = useState('');
  const [pendingImage, setPendingImage] = useState<UploadableImage | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [shakeCount, setShakeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleEmailChange = (v: string) => {
    setEmail(v);
    if (emailError) setEmailError('');
    if (registerError) setRegisterError('');
  };

  const handleUsernameChange = (v: string) => {
    setUsername(v);
    if (usernameError) setUsernameError('');
    if (registerError) setRegisterError('');
  };

  const handlePasswordChange = (v: string) => {
    setPassword(v);
    if (passwordError) setPasswordError('');
    if (confirmError) setConfirmError('');
    if (registerError) setRegisterError('');
  };

  const handleConfirmChange = (v: string) => {
    setConfirm(v);
    if (confirmError) setConfirmError('');
    if (registerError) setRegisterError('');
  };

  const handleEmailBlur = () => {
    if (!shouldValidateOnBlur(email)) return;
    setEmailTouched(true);
    setEmailError(getRegEmailError(t, email));
  };

  const handleUsernameBlur = () => {
    if (!shouldValidateOnBlur(username)) return;
    setUsernameTouched(true);
    setUsernameError(getRegUsernameError(t, username));
  };

  const handlePasswordBlur = () => {
    if (!shouldValidatePasswordOnBlur(password)) return;
    setPasswordTouched(true);
    setPasswordError(getRegPasswordError(t, password));
  };

  const handleConfirmBlur = () => {
    if (!shouldValidatePasswordOnBlur(confirm)) return;
    setConfirmTouched(true);
    setConfirmError(getRegConfirmError(t, confirm, password));
  };

  const togglePasswordVisibility = () => setPasswordVisible((v) => !v);

  const openPhotoSheet = () => setSheetVisible(true);
  const closePhotoSheet = () => setSheetVisible(false);

  const handleSelectSource = async (source: PickSource) => {
    setSheetVisible(false);
    await afterInteractions();
    // Only pick + validate here. Uploading before registration would hit POST /uploads
    // without a token (401), so we keep the local image and upload it after register().
    const picked = await pickImage(source);
    if (picked.status === 'picked') {
      setPendingImage(picked.image);
      setPhotoUrl(picked.image.uri);
      if (registerError) setRegisterError('');
    } else if (picked.status === 'error') {
      setRegisterError(getPhotoErrorMessage(t, picked.code));
      setShakeCount((c) => c + 1);
    }
  };

  const resetShake = () => setShakeCount(0);

  const handleSubmit = async () => {
    setEmailTouched(true);
    setUsernameTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);
    const eErr = getRegEmailError(t, email);
    const uErr = getRegUsernameError(t, username);
    const pErr = getRegPasswordError(t, password);
    const cErr = getRegConfirmError(t, confirm, password);
    setEmailError(eErr);
    setUsernameError(uErr);
    setPasswordError(pErr);
    setConfirmError(cErr);
    if (eErr || uErr || pErr || cErr) {
      setShakeCount((c) => c + 1);
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.register({
        email: email.trim(),
        username: username.trim(),
        password,
      });
      if (!result.ok) {
        if (result.error.field === 'email') {
          setEmailTouched(true);
          setEmailError(t('auth.errors.emailInUse'));
        } else if (result.error.field === 'username') {
          setUsernameTouched(true);
          setUsernameError(t('auth.errors.usernameTaken'));
        } else {
          setRegisterError(t('auth.errors.registrationFailed'));
        }
        setShakeCount((c) => c + 1);
        return;
      }

      // Account exists and the bearer token is stored — now the avatar can be uploaded.
      // Photo failures are non-fatal: the account is already created and the user can set
      // an avatar later from their profile, so we proceed without it rather than blocking.
      let finalPhotoUrl: string | undefined;
      if (pendingImage) {
        setUploading(true);
        const uploaded = await uploadService.uploadImage(pendingImage);
        setUploading(false);
        if (uploaded.ok) {
          finalPhotoUrl = uploaded.value.url;
          await profileService.editProfile(result.value.userId, { photoUrl: finalPhotoUrl });
        }
      }

      const dispatchResult = dispatch({
        type: 'auth/register',
        email: email.trim(),
        username: username.trim(),
        accountId: result.value.accountId,
        userId: result.value.userId,
        photoUrl: finalPhotoUrl,
      });
      if (!dispatchResult.ok) {
        if (dispatchResult.error.field === 'email') {
          setEmailError(mapReducerError(t, dispatchResult.error));
        } else if (dispatchResult.error.field === 'username') {
          setUsernameError(mapReducerError(t, dispatchResult.error));
        } else {
          setRegisterError(mapReducerError(t, dispatchResult.error));
        }
        setShakeCount((c) => c + 1);
        return;
      }
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    username,
    password,
    confirm,
    photoUrl,
    emailTouched,
    usernameTouched,
    passwordTouched,
    confirmTouched,
    emailError,
    usernameError,
    passwordError,
    confirmError,
    registerError,
    shakeCount,
    isLoading,
    uploading,
    sheetVisible,
    passwordVisible,
    handleEmailChange,
    handleUsernameChange,
    handlePasswordChange,
    handleConfirmChange,
    handleEmailBlur,
    handleUsernameBlur,
    handlePasswordBlur,
    handleConfirmBlur,
    togglePasswordVisibility,
    openPhotoSheet,
    closePhotoSheet,
    handleSelectSource,
    handleSubmit,
    resetShake,
  };
}
