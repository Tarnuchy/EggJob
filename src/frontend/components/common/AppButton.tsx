import React, { useRef, useEffect } from 'react';
import {
    Text,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    Animated,
    Easing,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { duration } from '../../theme/animations';

interface Props {
    title?: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    shakeCount?: number;
}

export const AppButton = ({ title, onPress, style, disabled, shakeCount }: Props) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const ease = Easing.bezier(0.25, 1, 0.5, 1);

    // Technique #2 Feedback — subtle button shake on error
    useEffect(() => {
        if (!shakeCount) return;
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -4, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 3, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -3, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]).start();
    }, [shakeCount]);

    const handlePressIn = () => {
        Animated.timing(scaleAnim, {
            toValue: 0.96,
            duration: duration.micro,
            easing: ease,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration.micro,
            easing: ease,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View
            style={[
                styles.shadow,
                {
                    transform: [
                        { scale: scaleAnim },
                        { translateX: shakeAnim },
                    ],
                },
                disabled && styles.shadowDisabled,
                style,
            ]}
        >
            <TouchableOpacity
                style={[styles.button, disabled && styles.buttonDisabled]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                disabled={disabled}
            >
                <Text style={styles.text}>{title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    shadow: {
        width: '100%',
        borderRadius: 12,
        shadowColor: '#6B3F22',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: shadows.level3.elevation,
    },
    shadowDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    button: {
        width: '100%',
        minHeight: 48,
        borderRadius: 12,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        overflow: 'hidden',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    text: {
        color: colors.textOnPrimary,
        ...typography.button,
    },
});
