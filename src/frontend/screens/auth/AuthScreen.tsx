import React, { useState } from 'react';
import { StyleSheet, View, Text, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { AuthBackground } from '../../components/auth/AuthBackground';
import { AuthTabSwitcher } from '../../components/auth/AuthTabSwitcher';
import type { AuthTab } from '../../components/auth/AuthTabSwitcher';
import { Spacer } from '../../components/common/Spacer';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAuthFormAnimation } from '../../hooks/useAuthFormAnimation';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthScreen = () => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const { cardEntrance, formOpacity, animateTabSwitch } = useAuthFormAnimation();

  const handleTabChange = (tab: AuthTab) => {
    if (tab === activeTab) return;
    animateTabSwitch();
    setActiveTab(tab);
  };

  const handleAuthSuccess = () => {
    navigation.replace('Main');
  };

  return (
    <View style={styles.root}>
      <AuthBackground />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}
        >
          <View style={styles.content}>
            <Text style={styles.appName}>{t('app.name')}</Text>
            <Spacer height={spacing.md} />

            <Animated.View style={[styles.cardShadow, cardEntrance]}>
              <BlurView intensity={12} tint="light" style={styles.blur}>
                <View style={styles.cardInner}>
                  <AuthTabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
                  <Spacer height={spacing.md} />

                  <Animated.View style={{ opacity: formOpacity }}>
                    {activeTab === 'login' ? (
                      <LoginForm onSuccess={handleAuthSuccess} isActive={activeTab === 'login'} />
                    ) : (
                      <RegisterForm
                        onSuccess={handleAuthSuccess}
                        isActive={activeTab === 'register'}
                      />
                    )}
                  </Animated.View>
                </View>
              </BlurView>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  appName: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cardShadow: {
    width: '100%',
    borderRadius: 24,
    shadowColor: colors.shadowAccent,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
  },
  blur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardInner: {
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    borderRadius: 24,
    padding: spacing.lg,
  },
});
