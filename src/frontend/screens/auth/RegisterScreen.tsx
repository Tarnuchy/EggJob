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
import {
    isValidEmail,
    isValidPassword,
    isValidUsername,
    passwordsMatch,
} from '../../utils/validation';

export const RegisterScreen = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const { dispatch } = useAppState();

	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const handleRegister = async () => {
		setErrorMessage('');

		if (!isValidEmail(email.trim())) {
			setErrorMessage('Please enter a valid email address.');
			return;
		}
		if (!isValidUsername(username.trim())) {
			setErrorMessage('Username must be at least 3 characters.');
			return;
		}
		if (!isValidPassword(password)) {
			setErrorMessage('Password must be at least 8 characters.');
			return;
		}
		if (!passwordsMatch(password, confirmPassword)) {
			setErrorMessage('Passwords do not match.');
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
					setErrorMessage('This email is already in use.');
				} else if (result.error.field === 'username') {
					setErrorMessage('This username is already taken.');
				} else {
					setErrorMessage('Registration failed. Please try again.');
				}
				return;
			}
			dispatch({
				type: 'auth/register',
				email: email.trim(),
				username: username.trim(),
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
				Create your account
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
				placeholder='Username'
				message={username}
				onChangeText={setUsername}
				style={styles.input}
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
			<AppInput
				placeholder='Confirm Password'
				message={confirmPassword}
				onChangeText={setConfirmPassword}
				style={styles.input}
				secureTextEntry
			/>
			<ErrorMessage message={errorMessage} visible={Boolean(errorMessage)} />
			<Spacer height={20} width={20} />
			{isLoading ? (
				<LoadingIndicator />
			) : (
				<AppButton
					title='Create Account'
					onPress={handleRegister}
					disabled={isLoading}
					style={styles.button}
				/>
			)}
			<Spacer height={24} width={24} />
			<View style={styles.loginContainer}>
				<AppText color={colors.textPrimary} style={styles.loginText}>
					Already have an account?
				</AppText>
				<TouchableOpacity onPress={() => navigation.navigate('Login')}>
					<AppText color={colors.primary} style={styles.loginLinkText}>
						Login
					</AppText>
				</TouchableOpacity>
			</View>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	loginContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	loginText: {
		marginRight: 10,
	},
	loginLinkText: {
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
