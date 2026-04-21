import react from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { AppText } from '../../components/common/AppText';
import { Spacer } from '../../components/common/Spacer';
import { colors } from '../../theme/colors';

export const RegisterScreen = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

	const [email, setEmail] = react.useState('');
	const [password, setPassword] = react.useState('');
	const [confirmPassword, setConfirmPassword] = react.useState('');

	const handleRegister = () => {
		// console.log('Registering with', email, password, confirmPassword);
		navigation.replace('BottomBar');
	};

	return (
		<ScreenContainer style={styles.container}>
			<AppText style={styles.title} color={colors.textPrimary} children='EggJob🥚' variant='default'></AppText>
			<Spacer height={50} width={50}></Spacer>

			{/* Formularz rejestracji */}
			<AppInput placeholder='Email' message={email} onChangeText={setEmail} style={styles.input} />
			<AppInput placeholder='Password' message={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
			<AppInput placeholder='Confirm Password' message={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} secureTextEntry />
			<Spacer height={20} width={20}></Spacer>
			<AppButton title='Register' onPress={handleRegister} style={styles.button} />
			<Spacer height={20} width={20}></Spacer>
			<View style={styles.loginContainer}>
				<AppText color={colors.textPrimary} children='Already have an account?' variant='default' style={styles.loginText}></AppText>
				<TouchableOpacity onPress={() => navigation.navigate('Login')}>
					<AppText color={colors.primary} children='Login' variant='default' style={styles.loginLinkText}></AppText>
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
		width: '100%',
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
	},
	input: {
		width: '80%',
		marginBottom: 12,
	},
	button: {
		width: '80%',
	},
});
