import react from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, TextInput } from 'react-native';
import { ErrorMessage } from './ErrorMessage';

interface Props {
    label: string;
    touched: boolean;
    error: string; // jakby ktos chcial jakis slop wpisywal 
    placeholder: string; // zawsze musi byc taka konwencja w sumie
}

export const AppInput = ({ label, touched, error, placeholder }: Props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput style={[styles.input, touched && error && styles.inputError]}
            placeholder={placeholder} /> 
            <ErrorMessage message={error} visible = {touched} />
        </View>
    );
};

//Do ustalenia jak to ma wygladac 
const styles = StyleSheet.create({
    container: {
    },
    label: {
    },
    input: {
    },
    inputError: {
        
    },
});
