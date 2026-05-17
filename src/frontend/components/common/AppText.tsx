import type { ReactNode } from 'react';
import type { StyleProp, TextProps, TextStyle } from 'react-native';
import { Text } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Variant = keyof typeof typography;
type Color = keyof typeof colors;

interface Props extends TextProps {
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
  color?: Color;
  variant?: Variant;
}

export const AppText = ({
  children,
  style,
  color = 'textPrimary',
  variant = 'body',
  ...rest
}: Props) => {
  return (
    <Text {...rest} style={[typography[variant], { color: colors[color] }, style]}>
      {children}
    </Text>
  );
};
