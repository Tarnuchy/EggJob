import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../../application/AppStateContext';
import { authService } from '../../../services';
import { usePhotoUpload } from '../../../hooks/usePhotoUpload';
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
import type { PickSource } from '../../../utils/pickImage';

interface UseRegisterFormOptions {
  onSuccess: () => void;
}

export function useRegisterForm({ onSuccess }: UseRegisterFormOptions) {
  const { dispatch } = useAppState();
  const { t } = useTranslation();
  const { uploading, pickAndUpload } = usePhotoUpload();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
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
    const outcome = await pickAndUpload(source);
    if (outcome.status === 'uploaded') {
      setPhotoUrl(outcome.url);
      if (registerError) setRegisterError('');
    } else if (outcome.status === 'error') {
      setRegisterError(getPhotoErrorMessage(t, outcome.code));
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
        photoUrl: photoUrl || undefined,
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
      const dispatchResult = dispatch({
        type: 'auth/register',
        email: email.trim(),
        username: username.trim(),
        accountId: result.value.accountId,
        userId: result.value.userId,
        photoUrl: photoUrl || undefined,
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
