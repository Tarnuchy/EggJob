import react from 'react';
import { View, Text, StyleSheet, TextInput, StyleProp, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
    label?: string;
    touched?: boolean;
    error?: string;
    message?: string;
    placeholder?: string;
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
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput
                style={[styles.input, touched && error && styles.inputError, style]}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                value={displayValue}
                onChangeText={handleChange}
                secureTextEntry={false}
                autoCapitalize={useAsteriskMask ? 'none' : 'sentences'}
                autoCorrect={useAsteriskMask ? false : undefined}
                selectionColor={colors.primary}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 10,
    },
    label: {
        marginBottom: 6,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    input: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        backgroundColor: colors.surfaceAlt,
        color: colors.textPrimary,
        paddingHorizontal: 12,
    },
    inputError: {
        borderColor: colors.danger,
    },
});
