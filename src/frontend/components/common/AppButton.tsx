import { Text, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
    title?: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
}

export const AppButton = ({ title, onPress, style }: Props) => {
    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '100%',
        minHeight: 48,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    text: {
        color: colors.textOnPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
});
