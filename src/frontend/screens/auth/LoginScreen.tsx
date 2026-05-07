import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { AppText } from '../../components/common/AppText';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { Spacer } from '../../components/common/Spacer';
import { colors } from '../../theme/colors';
import { authService } from '../../services';
import { useAppState } from '../../application/AppStateContext';

export const LoginScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { dispatch } = useAppState();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        setErrorMessage('');

        if (!email.trim()) {
            setErrorMessage('Email is required.');
            return;
        }
        if (!password.trim()) {
            setErrorMessage('Password is required.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await authService.login({ email: email.trim(), password });
            if (!result.ok) {
                setErrorMessage('Invalid email or password.');
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

    return (
        <ScreenContainer style={styles.container}>
            <AppText style={styles.title} color={colors.textPrimary}>
                EggJob
            </AppText>
            <AppText style={styles.subtitle} color={colors.muted}>
                Sign in to continue
            </AppText>
            <Spacer height={16} width={16} />

            <AppInput
                placeholder='Email'
                message={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
            />
            <AppInput
                placeholder='Password'
                message={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />
            <ErrorMessage message={errorMessage} visible={Boolean(errorMessage)} />
            <Spacer height={20} width={20} />
            {isLoading ? (
                <LoadingIndicator />
            ) : (
                <AppButton title='Sign In' onPress={handleLogin} disabled={isLoading} style={styles.button} />
            )}
            <Spacer height={24} width={24} />

            <View style={styles.registerContainer}>
                <AppText color={colors.textPrimary} style={styles.registerText}>
                    Don't have an account?
                </AppText>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <AppText color={colors.primary} style={styles.registerLinkText}>
                        Register
                    </AppText>
                </TouchableOpacity>
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    registerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    registerText: {
        marginRight: 10,
    },
    registerLinkText: {
        fontWeight: '600',
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        lineHeight: 44,
    },
    subtitle: {
        marginBottom: 32,
    },
    input: {
        width: '100%',
        marginBottom: 12,
    },
    button: {
        width: '100%',
    },
});