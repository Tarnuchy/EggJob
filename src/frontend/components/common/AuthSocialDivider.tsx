import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const AuthSocialDivider = () => {
    return (
        <View style={styles.container}>
            <View style={styles.line} />
            <Text style={styles.label}>lub kontynuuj przez</Text>
            <View style={styles.line} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.xl, // 40px top/bottom — golden ratio margin
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(67, 38, 23, 0.2)',
    },
    label: {
        marginHorizontal: spacing.md,
        color: colors.muted,
        ...typography.caption,
    },
});
