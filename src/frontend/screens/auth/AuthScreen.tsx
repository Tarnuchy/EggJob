import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { RootStackParamList } from '../../navigation/types';

import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { AuthBackground } from '../../components/common/AuthBackground';
import { AuthTabSwitcher } from '../../components/common/AuthTabSwitcher';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { Spacer } from '../../components/common/Spacer';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { duration } from '../../theme/animations';
import { authService } from '../../services';
import { useAppState } from '../../application/AppStateContext';
import {
    isValidEmail,
    isValidPassword,
    isValidUsername,
    passwordsMatch,
} from '../../utils/validation';
import { AuthTab } from '../../types';

const EASE = Easing.bezier(0.25, 1, 0.5, 1);

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
    const staggerAnim = useRef(new Animated.Value(0)).current;
    const formOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(staggerAnim, {
            toValue: 1,
            duration: duration.medium,
            easing: EASE,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const handleTabChange = (tab: AuthTab) => {
        if (tab === activeTab) return;

        setLoginShakeCount(0);
        setRegisterShakeCount(0);

        formOpacity.stopAnimation();
        formOpacity.setValue(0.9);

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        setActiveTab(tab);

        Animated.timing(formOpacity, {
            toValue: 1,
            duration: 180,
            easing: EASE,
            useNativeDriver: true,
        }).start();
    };

    const cardEntrance = {
        opacity: staggerAnim,
        transform: [{ translateY: staggerAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
    };

    // ─── Login validation ─────────────────────────────────────
    const getEmailError = (v: string) => (!v.trim() ? 'Email is required.' : '');
    const getPasswordError = (v: string) => (!v.trim() ? 'Password is required.' : '');

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

    const shouldValidateOnBlur = (value: string) => value.trim().length > 0;
    const shouldValidatePasswordOnBlur = (value: string) => value.length > 0;

    const handleLogin = async () => {
        setEmailTouched(true);
        setPasswordTouched(true);
        const eErr = getEmailError(email);
        const pErr = getPasswordError(password);
        setEmailError(eErr);
        setPasswordError(pErr);
        if (eErr || pErr) { setLoginShakeCount(c => c + 1); return; }

        setIsLoading(true);
        try {
            const result = await authService.login({ email: email.trim(), password });
            if (!result.ok) {
                setLoginError('Invalid email or password.');
                setLoginShakeCount(c => c + 1);
                return;
            }
            dispatch({ type: 'auth/login', accountId: result.value.accountId, userId: result.value.userId });
            navigation.replace('BottomBar');
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Register validation ──────────────────────────────────
    const getRegEmailError = (v: string) => (!isValidEmail(v.trim()) ? 'Please enter a valid email address.' : '');
    const getRegUsernameError = (v: string) => (!isValidUsername(v.trim()) ? 'At least 3 characters.' : '');
    const getRegPasswordError = (v: string) => (!isValidPassword(v) ? 'At least 8 characters.' : '');
    const getRegConfirmError = (v: string, pw: string) => {
        if (!v.trim()) return 'Please confirm your password.';
        if (!passwordsMatch(pw, v)) return 'Passwords do not match.';
        return '';
    };

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
        if (eErr || uErr || pErr || cErr) { setRegisterShakeCount(c => c + 1); return; }

        setIsLoading(true);
        try {
            const result = await authService.register({ email: regEmail.trim(), username: regUsername.trim(), password: regPassword });
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
                setRegisterShakeCount(c => c + 1);
                return;
            }
            dispatch({ type: 'auth/register', email: regEmail.trim(), username: regUsername.trim(), accountId: result.value.accountId, userId: result.value.userId });
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
                                                    onTogglePasswordVisibility={() => setRegPasswordVisible(v => !v)}
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
                                                    onTogglePasswordVisibility={() => setRegPasswordVisible(v => !v)}
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
                                                {registerError ? <Text style={styles.errorText}>⚠️ {registerError}</Text> : null}
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
