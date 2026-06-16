import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { AppButton } from '../../../components/common/AppButton';
import { OutlineButton } from '../../../components/common/OutlineButton';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppNavigation } from '../../../hooks/useAppNavigation';

export const HomeOnboarding = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();

  return (
    <View style={styles.card}>
      <Ionicons name="sparkles-outline" size={48} color={colors.primary} />
      <AppText variant="h2" color="textPrimary" style={styles.center}>
        {t('home.onboarding.title')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.center}>
        {t('home.onboarding.message')}
      </AppText>
      <View style={styles.actions}>
        <AppButton title={t('home.onboarding.ctaCreateGroup')} onPress={() => navigation.navigate('CreateGroup')} />
        <OutlineButton
          title={t('home.onboarding.ctaAddFriends')}
          onPress={() => navigation.navigate('Main', { screen: 'Friends', params: { initialTab: 'addFriend' } })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  center: { textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.sm },
});
