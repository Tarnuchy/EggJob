import react from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { AppText } from '../../components/common/AppText';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Spacer } from '../../components/common/Spacer';
// LoadingIndicator

export const LoginScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [email, setEmail] = react.useState('');
    const [password, setPassword] = react.useState('');

    const handleLogin = () => {
        // console.log('Logging in with', email, password);
        navigation.replace('BottomBar');
    };

    return (
        <ScreenContainer style={styles.container}>
            <AppText style={styles.title} color='black' children='EggJob🥚' variant='default'></AppText>
            <Spacer height={50} width={50}></Spacer>

            {/* Formularz logowania */}
            <AppInput placeholder='Email' message={email} onChangeText={setEmail} style={styles.input} />
            <AppInput placeholder='Password' message={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
            <Spacer height={20} width={20}></Spacer>
            <AppButton title='Login' onPress={handleLogin} style={styles.button} />
            <Spacer height={20} width={20}></Spacer>
            <View style={styles.registerContainer}>
                <AppText color='black' children="Don't have an account?" variant='default' style={styles.registerText}></AppText>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <AppText color='#007AFF' children='Register' variant='default' style={styles.registerLinkText}></AppText>
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