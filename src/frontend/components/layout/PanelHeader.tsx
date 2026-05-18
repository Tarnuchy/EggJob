import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { strings } from '../../i18n/strings';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface Props {
  title: string;
  iconFilled: IoniconName;
  onClose: () => void;
}

export const PanelHeader = ({ title, iconFilled, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.host}>
      <BlurView intensity={20} tint="light" style={styles.blur}>
        <View style={[styles.bg, { paddingTop: insets.top }]}>
          <View style={styles.row}>
            <View style={styles.left}>
              <Ionicons name={iconFilled} size={22} color={colors.primary} />
              <AppText variant="h2" color="textPrimary">
                {title}
              </AppText>
            </View>
            <View style={styles.right}>
              <Pressable
                style={({ pressed }) => [
                  backStyles.button,
                  pressed && backStyles.buttonPressed,
                ]}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={strings.topBar.back}
              >
                <Ionicons name="arrow-back" size={22} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowOffset: { width: 0, height: 8 },
  },
  blur: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  bg: {
    backgroundColor: colors.cardSurfaceTranslucent,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderTranslucent,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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

const backStyles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    backgroundColor: colors.cardSurfaceTranslucent,
  },
  buttonPressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.08)',
  },
});
