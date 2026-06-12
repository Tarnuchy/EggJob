import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface Props {
  photoUrl?: string;
  size?: number;
  accessibilityLabel?: string;
}

export const Avatar = ({ photoUrl, size = 44, accessibilityLabel }: Props) => {
  const radius = size / 2;
  const iconSize = Math.round(size * 0.55);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: radius },
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
        />
      ) : (
        <Ionicons name="person" size={iconSize} color={colors.textOnPrimary} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
