import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { strings } from '../../i18n/strings';
import { isSectionName, SECTION_CONFIG } from '../../navigation/sectionConfig';
import { usePanelContext } from '../../navigation/PanelContext';

export const TopBar = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();

  if (!isSectionName(route.name)) return null;
  const config = SECTION_CONFIG[route.name];

  return (
    <View style={styles.host}>
      <BlurView intensity={20} tint="light" style={styles.blur}>
        <View style={[styles.bg, { paddingTop: insets.top }]}>
          <View style={styles.row}>
            <View style={styles.left}>
              <Ionicons name={config.iconFilled} size={22} color={colors.primary} />
              <AppText variant="h2" color="textPrimary">
                {config.label}
              </AppText>
            </View>
            <View style={styles.right}>
              <RightActionsPill />
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const RightActionsPill = () => {
  const { openPanel, setOpenPanel } = usePanelContext();
  const notificationsConfig = SECTION_CONFIG.Notifications;
  const settingsConfig = SECTION_CONFIG.Settings;

  return (
    <View style={pillStyles.pill}>
      <Pressable
        style={({ pressed }) => [pillStyles.button, pressed && pillStyles.buttonPressed]}
        onPress={() => setOpenPanel('notifications')}
        accessibilityRole="button"
        accessibilityLabel={strings.topBar.notifications}
      >
        <Ionicons
          name={
            openPanel === 'notifications'
              ? notificationsConfig.iconFilled
              : notificationsConfig.iconOutline
          }
          size={20}
          color={colors.primary}
        />
      </Pressable>
      <View style={pillStyles.divider} />
      <Pressable
        style={({ pressed }) => [pillStyles.button, pressed && pillStyles.buttonPressed]}
        onPress={() => setOpenPanel('settings')}
        accessibilityRole="button"
        accessibilityLabel={strings.topBar.settings}
      >
        <Ionicons
          name={
            openPanel === 'settings' ? settingsConfig.iconFilled : settingsConfig.iconOutline
          }
          size={20}
          color={colors.primary}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 8 },
  },
  blur: {
    overflow: 'hidden',
  },
  bg: {
    backgroundColor: colors.cardSurfaceTranslucent,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderTranslucent,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    height: 64,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  right: {},
});

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    backgroundColor: colors.cardSurfaceTranslucent,
  },
  button: {
    width: 44,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.08)',
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: colors.cardBorderTranslucent,
  },
});
