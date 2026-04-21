import type { ReactNode } from 'react';
import { Text, StyleSheet, TextProps, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';


interface Props extends TextProps {
    children?: ReactNode;
    style?: TextStyle | TextStyle[];
    color?: string;
    variant?: 'default';
}

export const AppText = ({ children, style, color = colors.textPrimary, variant = 'default' }: Props) => {
    return (
        <Text style={[styles[variant], { color }, style]}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    default: {
        color: colors.textPrimary,
        fontSize: 16,
        lineHeight: 22,
    },
});