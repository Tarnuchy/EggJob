import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import type { GreetingKey } from '../logic/greeting';

interface Props {
  displayName: string;
  greetingKey: GreetingKey;
}

export const GreetingHero = ({ displayName, greetingKey }: Props) => {
  const { t } = useTranslation();
  const greeting = t(`home.greeting.${greetingKey}`);

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryPressed]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <AppText variant="h1" color="textOnPrimary" numberOfLines={1}>
        {t('home.greeting.withName', { greeting, name: displayName })}
      </AppText>
      <AppText variant="body" color="textOnPrimary" style={styles.subtitle}>
        {t('home.greeting.subtitle')} 🍂
      </AppText>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  hero: {
    borderRadius: 22,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  subtitle: {
    opacity: 0.85,
  },
});
