import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '../../components/common/Avatar';
import { AppText } from '../../components/common/AppText';
import { profileService } from '../../services';
import { strings } from '../../i18n/strings';
import { colors } from '../../theme/colors';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import type { RootStackParamList } from '../../navigation/types';

type Route = RouteProp<RootStackParamList, 'UserProfile'>;

export const UserProfileScreen = () => {
  const navigation = useAppNavigation();
  const route = useRoute<Route>();
  const { userId } = route.params;

  const [username, setUsername] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await profileService.getProfile(userId);
      if (cancelled) return;
      if (result.ok) {
        setUsername(result.value.username);
        setPhotoUrl(result.value.photoUrl);
      } else {
        setUsername(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={strings.topBar.back}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <AppText variant="h2" color="textPrimary">
          {strings.friends.profile.title}
        </AppText>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Avatar photoUrl={photoUrl} size={120} />
            <AppText variant="h1" color="textPrimary" style={styles.username}>
              {username ?? strings.friends.profile.unknownUser}
            </AppText>
            <AppText variant="body" color="textSecondary" style={styles.placeholder}>
              {strings.friends.profile.placeholder}
            </AppText>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING_H,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.08)',
  },
  headerSpacer: {
    width: 40,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING_H,
    gap: spacing.md,
  },
  username: {
    marginTop: spacing.md,
  },
  placeholder: {
    textAlign: 'center',
  },
});
