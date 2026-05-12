import React, { useState } from 'react';
import { StyleSheet, View, Text, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import type { RootStackParamList } from '../../navigation/types';

import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { AuthBackground } from '../../components/common/AuthBackground';
import { AuthTabSwitcher } from '../../components/common/AuthTabSwitcher';
import { Spacer } from '../../components/common/Spacer';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { authService } from '../../services';
import { useAppState } from '../../application/AppStateContext';
import {
  getEmailError,
  getPasswordError,
  getRegConfirmError,
  getRegEmailError,
  getRegPasswordError,
  getRegUsernameError,
  shouldValidateOnBlur,
  shouldValidatePasswordOnBlur,
} from '../../utils/authValidation';
import type { AuthTab } from '../../types';
import { useAuthFormAnimation } from '../../hooks/useAuthFormAnimation';

export const AuthScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { dispatch } = useAppState();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [isLoading, setIsLoading] = useState(false);

  // ─── Login state ─────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginShakeCount, setLoginShakeCount] = useState(0);

  // ─── Register state ───────────────────────────────────────
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regEmailTouched, setRegEmailTouched] = useState(false);
  const [regUsernameTouched, setRegUsernameTouched] = useState(false);
  const [regPasswordTouched, setRegPasswordTouched] = useState(false);
  const [regConfirmTouched, setRegConfirmTouched] = useState(false);
  const [regEmailError, setRegEmailError] = useState('');
  const [regUsernameError, setRegUsernameError] = useState('');
  const [regPasswordError, setRegPasswordError] = useState('');
  const [regConfirmError, setRegConfirmError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerShakeCount, setRegisterShakeCount] = useState(0);
  const [regPasswordVisible, setRegPasswordVisible] = useState(false);

  // ─── Animations ───────────────────────────────────────────
  const { cardEntrance, formOpacity, animateTabSwitch } = useAuthFormAnimation();

  const handleTabChange = (tab: AuthTab) => {
    if (tab === activeTab) return;

    setLoginShakeCount(0);
    setRegisterShakeCount(0);

    animateTabSwitch();
    setActiveTab(tab);
  };

  // ─── Login handlers ───────────────────────────────────────
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

  const handleLogin = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    const eErr = getEmailError(email);
    const pErr = getPasswordError(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) {
      setLoginShakeCount((c) => c + 1);
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login({ email: email.trim(), password });
      if (!result.ok) {
        setLoginError('Invalid email or password.');
        setLoginShakeCount((c) => c + 1);
        return;
      }
      dispatch({
        type: 'auth/login',
        accountId: result.value.accountId,
        userId: result.value.userId,
      });
      navigation.replace('BottomBar');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Register handlers ────────────────────────────────────
  const handleRegEmailChange = (v: string) => {
    setRegEmail(v);
    if (regEmailError) setRegEmailError('');
    if (registerError) setRegisterError('');
  };
  const handleRegUsernameChange = (v: string) => {
    setRegUsername(v);
    if (regUsernameError) setRegUsernameError('');
    if (registerError) setRegisterError('');
  };
  const handleRegPasswordChange = (v: string) => {
    setRegPassword(v);
    if (regPasswordError) setRegPasswordError('');
    if (regConfirmError) setRegConfirmError('');
    if (registerError) setRegisterError('');
  };
  const handleRegConfirmChange = (v: string) => {
    setRegConfirm(v);
    if (regConfirmError) setRegConfirmError('');
    if (registerError) setRegisterError('');
  };

  const handleRegister = async () => {
    setRegEmailTouched(true);
    setRegUsernameTouched(true);
    setRegPasswordTouched(true);
    setRegConfirmTouched(true);
    const eErr = getRegEmailError(regEmail);
    const uErr = getRegUsernameError(regUsername);
    const pErr = getRegPasswordError(regPassword);
    const cErr = getRegConfirmError(regConfirm, regPassword);
    setRegEmailError(eErr);
    setRegUsernameError(uErr);
    setRegPasswordError(pErr);
    setRegConfirmError(cErr);
    if (eErr || uErr || pErr || cErr) {
      setRegisterShakeCount((c) => c + 1);
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.register({
        email: regEmail.trim(),
        username: regUsername.trim(),
        password: regPassword,
      });
      if (!result.ok) {
        if (result.error.field === 'email') {
          setRegEmailTouched(true);
          setRegEmailError('This email is already in use.');
        } else if (result.error.field === 'username') {
          setRegUsernameTouched(true);
          setRegUsernameError('This username is already taken.');
        } else {
          setRegisterError('Registration failed. Please try again.');
        }
        setRegisterShakeCount((c) => c + 1);
        return;
      }
      dispatch({
        type: 'auth/register',
        email: regEmail.trim(),
        username: regUsername.trim(),
        accountId: result.value.accountId,
        userId: result.value.userId,
      });
      navigation.replace('BottomBar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <AuthBackground />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}
        >
          <View style={styles.content}>
            <Text style={styles.appName}>EggJob</Text>
            <Spacer height={spacing.md} />

            {/* Glass card */}
            <Animated.View style={[styles.cardShadow, cardEntrance]}>
              <BlurView intensity={12} tint="light" style={styles.blur}>
                <View style={styles.cardInner}>
                  <AuthTabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
                  <Spacer height={spacing.md} />

                  <Animated.View style={{ opacity: formOpacity }}>
                    {activeTab === 'login' ? (
                      <>
                        <AppInput
                          label="Email"
                          placeholder="Your Email"
                          message={email}
                          onChangeText={handleEmailChange}
                          onBlur={() => {
                            if (!shouldValidateOnBlur(email)) return;
                            setEmailTouched(true);
                            setEmailError(getEmailError(email));
                          }}
                          touched={emailTouched}
                          error={emailError}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        <AppInput
                          label="Password"
                          placeholder="Your Password"
                          message={password}
                          onChangeText={handlePasswordChange}
                          onBlur={() => {
                            if (!shouldValidatePasswordOnBlur(password)) return;
                            setPasswordTouched(true);
                            setPasswordError(getPasswordError(password));
                          }}
                          touched={passwordTouched}
                          error={passwordError}
                          secureTextEntry
                        />
                        {loginError ? <Text style={styles.errorText}>⚠️ {loginError}</Text> : null}
                        <Spacer height={spacing.sm} />
                        <AppButton
                          title="Log In"
                          onPress={handleLogin}
                          shakeCount={loginShakeCount}
                          isLoading={isLoading}
                        />
                      </>
                    ) : (
                      <>
                        <AppInput
                          label="Email"
                          placeholder="Your Email"
                          message={regEmail}
                          onChangeText={handleRegEmailChange}
                          onBlur={() => {
                            if (!shouldValidateOnBlur(regEmail)) return;
                            setRegEmailTouched(true);
                            setRegEmailError(getRegEmailError(regEmail));
                          }}
                          touched={regEmailTouched}
                          error={regEmailError}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        <AppInput
                          label="Password"
                          placeholder="Your Password"
                          message={regPassword}
                          onChangeText={handleRegPasswordChange}
                          onBlur={() => {
                            if (!shouldValidatePasswordOnBlur(regPassword)) return;
                            setRegPasswordTouched(true);
                            setRegPasswordError(getRegPasswordError(regPassword));
                          }}
                          touched={regPasswordTouched}
                          error={regPasswordError}
                          secureTextEntry
                          passwordVisible={regPasswordVisible}
                          onTogglePasswordVisibility={() => setRegPasswordVisible((v) => !v)}
                        />
                        <AppInput
                          label="Confirm Password"
                          placeholder="Confirm Password"
                          message={regConfirm}
                          onChangeText={handleRegConfirmChange}
                          onBlur={() => {
                            if (!shouldValidatePasswordOnBlur(regConfirm)) return;
                            setRegConfirmTouched(true);
                            setRegConfirmError(getRegConfirmError(regConfirm, regPassword));
                          }}
                          touched={regConfirmTouched}
                          error={regConfirmError}
                          secureTextEntry
                          passwordVisible={regPasswordVisible}
                          onTogglePasswordVisibility={() => setRegPasswordVisible((v) => !v)}
                        />
                        <AppInput
                          label="Username"
                          placeholder="Your Username"
                          message={regUsername}
                          onChangeText={handleRegUsernameChange}
                          onBlur={() => {
                            if (!shouldValidateOnBlur(regUsername)) return;
                            setRegUsernameTouched(true);
                            setRegUsernameError(getRegUsernameError(regUsername));
                          }}
                          touched={regUsernameTouched}
                          error={regUsernameError}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        {registerError ? (
                          <Text style={styles.errorText}>⚠️ {registerError}</Text>
                        ) : null}
                        <Spacer height={spacing.sm} />
                        <AppButton
                          title="Create Account"
                          onPress={handleRegister}
                          shakeCount={registerShakeCount}
                          isLoading={isLoading}
                        />
                      </>
                    )}
                  </Animated.View>
                </View>
              </BlurView>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  appName: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cardShadow: {
    width: '100%',
    borderRadius: 24,
    shadowColor: colors.shadowAccent,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
  },
  blur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardInner: {
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    borderRadius: 24,
    padding: spacing.lg,
  },
  errorText: {
    marginBottom: spacing.sm,
    color: colors.danger,
    ...typography.caption,
  },
});
