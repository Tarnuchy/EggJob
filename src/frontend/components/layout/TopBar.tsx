import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { createSectionConfig, isSectionName } from '../../navigation/sectionConfig';
import { usePanelContext } from '../../navigation/PanelContext';
import { useNotifications } from '../../application/NotificationsContext';

interface Props {
  title?: string;
  showBackButton?: boolean;
  showRightActions?: boolean;
}

export const TopBar = ({ title, showBackButton = false, showRightActions = true }: Props) => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const isSection = isSectionName(route.name);
  const config = isSection ? createSectionConfig(t)[route.name] : null;

  if (!config && !title) return null;

  return (
    <View style={styles.host}>
      <BlurView intensity={20} tint="light" style={styles.blur}>
        <View style={[styles.bg, { paddingTop: insets.top }]}>
          <View style={styles.row}>
            <View style={styles.left}>
              {showBackButton ? (
                <Pressable
                  onPress={() => navigation.goBack()}
                  accessibilityRole="button"
                  accessibilityLabel={t('topBar.back')}
                  style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                >
                  <Ionicons name="arrow-back" size={20} color={colors.primary} />
                </Pressable>
              ) : config ? (
                <Ionicons name={config.iconFilled} size={22} color={colors.primary} />
              ) : null}
              <AppText variant="h2" color="textPrimary">
                {title ?? config?.label}
              </AppText>
            </View>
            <View style={styles.right}>
              {showRightActions && isSection ? <RightActionsPill /> : null}
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const RightActionsPill = () => {
  const { openPanel, setOpenPanel } = usePanelContext();
  const { hasUnread } = useNotifications();
  const { t } = useTranslation();
  const sectionConfig = createSectionConfig(t);
  const notificationsConfig = sectionConfig.Notifications;
  const settingsConfig = sectionConfig.Settings;

  return (
    <View style={pillStyles.pill}>
      <Pressable
        style={({ pressed }) => [pillStyles.button, pressed && pillStyles.buttonPressed]}
        onPress={() => setOpenPanel('notifications')}
        accessibilityRole="button"
        accessibilityLabel={
          hasUnread
            ? `${t('topBar.notifications')}, ${t('topBar.unreadNotifications')}`
            : t('topBar.notifications')
        }
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
        {hasUnread ? <View style={pillStyles.dot} /> : null}
      </Pressable>
      <View style={pillStyles.divider} />
      <Pressable
        style={({ pressed }) => [pillStyles.button, pressed && pillStyles.buttonPressed]}
        onPress={() => setOpenPanel('settings')}
        accessibilityRole="button"
        accessibilityLabel={t('topBar.settings')}
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
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(107, 63, 34, 0.08)',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.14)',
  },
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
  dot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
