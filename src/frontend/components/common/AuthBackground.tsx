import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Rect, RadialGradient, Stop, Pattern } from 'react-native-svg';
import { colors } from '../../theme/colors';

const GRAIN_OPACITY = 0.03;

export const AuthBackground = () => {
    return (
        <Svg style={styles.fill} width="100%" height="100%" pointerEvents="none">
            <Defs>
                <RadialGradient id="authGradient" cx="50%" cy="35%" r="85%">
                    <Stop offset="0%" stopColor={colors.surfaceAlt} stopOpacity={1} />
                    <Stop offset="60%" stopColor={colors.background} stopOpacity={1} />
                    <Stop offset="100%" stopColor={colors.primaryPressed} stopOpacity={1} />
                </RadialGradient>
                <Pattern id="grain" patternUnits="userSpaceOnUse" width={6} height={6}>
                    <Rect x={0} y={0} width={1} height={1} fill={colors.textPrimary} />
                    <Rect x={3} y={1} width={1} height={1} fill={colors.textPrimary} />
                    <Rect x={5} y={4} width={1} height={1} fill={colors.textPrimary} />
                    <Rect x={2} y={5} width={1} height={1} fill={colors.textPrimary} />
                    <Rect x={1} y={3} width={1} height={1} fill={colors.textPrimary} />
                </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#authGradient)" />
            <Rect width="100%" height="100%" fill="url(#grain)" opacity={GRAIN_OPACITY} />
        </Svg>
    );
};

const styles = StyleSheet.create({
    fill: {
        ...StyleSheet.absoluteFillObject,
    },
});
