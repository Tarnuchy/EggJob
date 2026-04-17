import react from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import { ScreenContainer } from '../components/ScreenContainer';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppText } from '../components/AppText';
import { Spacer } from '../components/Spacer';

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
			<AppText style={styles.title} color='black' children='EggJob🥚' variant='default'></AppText>
			<Spacer height={50} width={50}></Spacer>

			{/* Formularz rejestracji */}
			<AppInput placeholder='Email' message={email} onChangeText={setEmail} style={styles.input} />
			<AppInput placeholder='Password' message={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
			<AppInput placeholder='Confirm Password' message={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} secureTextEntry />
			<Spacer height={20} width={20}></Spacer>
			<AppButton title='Register' onPress={handleRegister} style={styles.button} />
			<Spacer height={20} width={20}></Spacer>
			<View style={styles.loginContainer}>
				<AppText color='black' children='Already have an account?' variant='default' style={styles.loginText}></AppText>
				<TouchableOpacity onPress={() => navigation.navigate('Login')}>
					<AppText color='#007AFF' children='Login' variant='default' style={styles.loginLinkText}></AppText>
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
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
	},
	input: {
		width: '80%',
		height: 50,
		borderColor: 'gray',
		borderWidth: 1,
		borderRadius: 5,
		paddingHorizontal: 10,
		marginBottom: 15,
	},
	button: {
		width: '80%',
		height: 50,
		backgroundColor: '#007AFF',
		borderRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
