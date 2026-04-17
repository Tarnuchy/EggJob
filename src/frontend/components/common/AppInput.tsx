import react from 'react';
import { View, Text, StyleSheet, TextInput, StyleProp, TextStyle } from 'react-native';

interface Props {
    label?: string;
    touched?: boolean;
    error?: string; // jakby ktos chcial jakis slop wpisywal 
    message?: string;
    placeholder?: string; // zawsze musi byc taka konwencja w sumie
    style?: StyleProp<TextStyle>;
    onChangeText?: (text: string) => void;
    secureTextEntry?: boolean;
}

export const AppInput = ({
    label,
    touched,
    error,
    message,
    placeholder,
    style,
    onChangeText,
    secureTextEntry,
}: Props) => {
    const value = message ?? '';
    const useAsteriskMask = Boolean(secureTextEntry);
    const displayValue = useAsteriskMask ? '*'.repeat(value.length) : value;

    const handleChange = (inputText: string) => {
        if (!onChangeText) {
            return;
        }

        if (!useAsteriskMask) {
            onChangeText(inputText);
            return;
        }

        const previousLength = value.length;
        const nextLength = inputText.length;

        if (nextLength < previousLength) {
            onChangeText(value.slice(0, nextLength));
            return;
        }

        if (nextLength === previousLength) {
            return;
        }

        const appendedPart = inputText.slice(previousLength);
        const appendedChars = appendedPart.replace(/\*/g, '');

        if (appendedChars.length > 0) {
            onChangeText(value + appendedChars);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput style={[styles.input, touched && error && styles.inputError, style]}
            placeholder={placeholder}
            value={displayValue}
            onChangeText={handleChange}
            secureTextEntry={false}
            autoCapitalize={useAsteriskMask ? 'none' : 'sentences'}
            autoCorrect={useAsteriskMask ? false : undefined}
            /> 
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
