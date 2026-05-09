import { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    Easing,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { duration } from '../theme/animations';

const EASE = Easing.bezier(0.25, 1, 0.5, 1);

export const useAuthFormAnimation = () => {
    const staggerAnim = useRef(new Animated.Value(0)).current;
    const formOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(staggerAnim, {
            toValue: 1,
            duration: duration.medium,
            easing: EASE,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const cardEntrance = useMemo(
        () => ({
            opacity: staggerAnim,
            transform: [
                {
                    translateY: staggerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [24, 0],
                    }),
                },
            ],
        }),
        [staggerAnim],
    );

    const animateTabSwitch = () => {
        formOpacity.stopAnimation();
        formOpacity.setValue(0.9);

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        Animated.timing(formOpacity, {
            toValue: 1,
            duration: 180,
            easing: EASE,
            useNativeDriver: true,
        }).start();
    };

    return { cardEntrance, formOpacity, animateTabSwitch };
};
