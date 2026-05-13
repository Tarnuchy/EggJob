import { useState } from 'react';
import { useAppState } from '../../../application/AppStateContext';
import { strings } from '../../../i18n/strings';
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
    setEmailError(getEmailError(email));
  };

  const handlePasswordBlur = () => {
    if (!shouldValidatePasswordOnBlur(password)) return;
    setPasswordTouched(true);
    setPasswordError(getPasswordError(password));
  };

  const resetShake = () => setShakeCount(0);

  const handleSubmit = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    const eErr = getEmailError(email);
    const pErr = getPasswordError(password);
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
        setLoginError(strings.auth.errors.loginFailed);
        setShakeCount((c) => c + 1);
        return;
      }
      const dispatchResult = dispatch({
        type: 'auth/login',
        accountId: result.value.accountId,
        userId: result.value.userId,
      });
      if (!dispatchResult.ok) {
        setLoginError(mapReducerError(dispatchResult.error));
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
