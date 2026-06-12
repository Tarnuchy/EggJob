import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../../application/AppStateContext';
import { authService } from '../../../services';
import {
  getEmailError,
  getPasswordError,
  shouldValidateOnBlur,
  shouldValidatePasswordOnBlur,
} from '../../../utils/authValidation';
import { mapReducerError } from '../../../utils/mapReducerError';

interface UseLoginFormOptions {
  onSuccess: () => void;
}

export function useLoginForm({ onSuccess }: UseLoginFormOptions) {
  const { dispatch } = useAppState();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [shakeCount, setShakeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (v: string) => {
    setEmail(v);
    if (emailError) setEmailError('');
    if (loginError) setLoginError('');
  };

  const handlePasswordChange = (v: string) => {
    setPassword(v);
    if (passwordError) setPasswordError('');
    if (loginError) setLoginError('');
  };

  const handleEmailBlur = () => {
    if (!shouldValidateOnBlur(email)) return;
    setEmailTouched(true);
    setEmailError(getEmailError(t, email));
  };

  const handlePasswordBlur = () => {
    if (!shouldValidatePasswordOnBlur(password)) return;
    setPasswordTouched(true);
    setPasswordError(getPasswordError(t, password));
  };

  const resetShake = () => setShakeCount(0);

  const handleSubmit = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    const eErr = getEmailError(t, email);
    const pErr = getPasswordError(t, password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) {
      setShakeCount((c) => c + 1);
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login({ email: email.trim(), password });
      if (!result.ok) {
        setLoginError(t('auth.errors.loginFailed'));
        setShakeCount((c) => c + 1);
        return;
      }
      const dispatchResult = dispatch({
        type: 'auth/login',
        accountId: result.value.accountId,
        userId: result.value.userId,
      });
      if (!dispatchResult.ok) {
        setLoginError(mapReducerError(t, dispatchResult.error));
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
    password,
    emailTouched,
    passwordTouched,
    emailError,
    passwordError,
    loginError,
    shakeCount,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleEmailBlur,
    handlePasswordBlur,
    handleSubmit,
    resetShake,
  };
}
