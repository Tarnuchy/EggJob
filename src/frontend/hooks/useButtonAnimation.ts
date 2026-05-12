import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { duration } from '../theme/animations';

interface Params {
  isLoading?: boolean;
  shakeCount?: number;
  minLoadTime?: number;
}

export const useButtonAnimation = ({ isLoading, shakeCount, minLoadTime = 1000 }: Params) => {
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

  return { scaleAnim, shakeAnim, isVisuallyLoading, handlePressIn, handlePressOut };
};
