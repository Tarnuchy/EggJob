import { Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

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

const styles = StyleSheet.create({
    button: {},
    text: {},
});
