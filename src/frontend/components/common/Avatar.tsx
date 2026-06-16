import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { resolvePhotoUri } from '../../utils/resolvePhotoUri';

interface Props {
  photoUrl?: string;
  size?: number;
  accessibilityLabel?: string;
}

export const Avatar = ({ photoUrl, size = 44, accessibilityLabel }: Props) => {
  const radius = size / 2;
  const iconSize = Math.round(size * 0.55);
  const resolvedUri = resolvePhotoUri(photoUrl);
  // Fall back to the person icon when a non-empty photo URL fails to load (e.g. a stale/404
  // backend media key). Reset on URI change so recycled FlatList rows don't stay stuck.
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [resolvedUri]);
  // Only expose as an accessibility element when there is a meaningful label; otherwise an
  // empty-label "image" (e.g. before a username is typed during registration) is just noise.
  const label = accessibilityLabel?.trim() ? accessibilityLabel : undefined;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: radius },
      ]}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
    >
      {resolvedUri && !failed ? (
        <Image
          source={{ uri: resolvedUri }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
          onError={() => setFailed(true)}
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
