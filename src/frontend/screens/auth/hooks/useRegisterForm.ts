import { useState } from 'react';
import { useAppState } from '../../../application/AppStateContext';
import { authService } from '../../../services';
import {
  getRegConfirmError,
  getRegEmailError,
  getRegPasswordError,
  getRegUsernameError,
  shouldValidateOnBlur,
  shouldValidatePasswordOnBlur,
} from '../../../utils/authValidation';
import { mapReducerError } from '../../../utils/mapReducerError';

interface UseRegisterFormOptions {
  onSuccess: () => void;
}

export function useRegisterForm({ onSuccess }: UseRegisterFormOptions) {
  const { dispatch } = useAppState();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
    setEmailError(getRegEmailError(email));
  };

  const handleUsernameBlur = () => {
    if (!shouldValidateOnBlur(username)) return;
    setUsernameTouched(true);
    setUsernameError(getRegUsernameError(username));
  };

  const handlePasswordBlur = () => {
    if (!shouldValidatePasswordOnBlur(password)) return;
    setPasswordTouched(true);
    setPasswordError(getRegPasswordError(password));
  };

  const handleConfirmBlur = () => {
    if (!shouldValidatePasswordOnBlur(confirm)) return;
    setConfirmTouched(true);
    setConfirmError(getRegConfirmError(confirm, password));
  };

  const togglePasswordVisibility = () => setPasswordVisible((v) => !v);

  const resetShake = () => setShakeCount(0);

  const handleSubmit = async () => {
    setEmailTouched(true);
    setUsernameTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);
    const eErr = getRegEmailError(email);
    const uErr = getRegUsernameError(username);
    const pErr = getRegPasswordError(password);
    const cErr = getRegConfirmError(confirm, password);
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
          setEmailError('This email is already in use.');
        } else if (result.error.field === 'username') {
          setUsernameTouched(true);
          setUsernameError('This username is already taken.');
        } else {
          setRegisterError('Registration failed. Please try again.');
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
      });
      if (!dispatchResult.ok) {
        if (dispatchResult.error.field === 'email') {
          setEmailError(mapReducerError(dispatchResult.error));
        } else if (dispatchResult.error.field === 'username') {
          setUsernameError(mapReducerError(dispatchResult.error));
        } else {
          setRegisterError(mapReducerError(dispatchResult.error));
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
    handleSubmit,
    resetShake,
  };
}
