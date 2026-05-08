import React, { useRef, useEffect, useState } from 'react';
import {
    Text,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    Animated,
    Easing,
    ActivityIndicator,
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
    isLoading?: boolean;
    minLoadTime?: number;
}

export const AppButton = ({ 
    title, 
    onPress, 
    style, 
    disabled, 
    shakeCount, 
    isLoading,
    minLoadTime = 1000, 
}: Props) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const [isVisuallyLoading, setIsVisuallyLoading] = useState(false);
    const loadingStartTime = useRef<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const prevShakeCount = useRef(shakeCount);
    const pendingShake = useRef(false);

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -4, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 3, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -3, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]).start();
    };

    useEffect(() => {
        if (isLoading) {
            setIsVisuallyLoading(true);
            loadingStartTime.current = Date.now();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        } else if (isVisuallyLoading && loadingStartTime.current !== null) {
            const timeElapsed = Date.now() - loadingStartTime.current;
            const timeRemaining = minLoadTime - timeElapsed;

            if (timeRemaining > 0) {
                timeoutRef.current = setTimeout(() => {
                    setIsVisuallyLoading(false);
                    loadingStartTime.current = null;
                }, timeRemaining);
            } else {
                setIsVisuallyLoading(false);
                loadingStartTime.current = null;
            }
        }
    }, [isLoading, minLoadTime]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (shakeCount === prevShakeCount.current) return;
        prevShakeCount.current = shakeCount;

        if (!shakeCount) return;

        if (isVisuallyLoading) {
            pendingShake.current = true;
        } else {
            triggerShake();
        }
    }, [shakeCount, isVisuallyLoading]);

    useEffect(() => {
        if (!isVisuallyLoading && pendingShake.current) {
            pendingShake.current = false;
            triggerShake();
        }
    }, [isVisuallyLoading]);

    const ease = Easing.bezier(0.25, 1, 0.5, 1);

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

    const isDisabled = disabled || isVisuallyLoading;

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
                isDisabled && styles.shadowDisabled,
                style,
            ]}
        >
            <TouchableOpacity
                style={[styles.button, isDisabled && styles.buttonDisabled]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                disabled={isDisabled}
            >
                {isVisuallyLoading ? (
                    <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                    <Text style={styles.text}>{title}</Text>
                )}
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