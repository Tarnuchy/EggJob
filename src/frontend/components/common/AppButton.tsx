import react from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, ViewStyle } from 'react-native';

interface Props {
    title?: string;
    onPress: () => void;
    style?: ViewStyle;
}

export const AppButton = ({ title, onPress, style }: Props) => {
    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

// Do ustalenia jak to ma wygladac
const styles = StyleSheet.create({
    button: {
    },
    text: {
    }
});
    