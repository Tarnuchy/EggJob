import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../common/AppText';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { strings } from '../../i18n/strings';
import { colors } from '../../theme/colors';

interface TopBarProps {
  title?: string;
  showIcons?: boolean;
}

export const TopBar = ({ title = '', showIcons = true }: TopBarProps) => {
  const navigation = useAppNavigation();
  const androidTopInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: androidTopInset }]}>
      <View style={styles.topBar}>
        <AppText color="textPrimary" variant="h2" style={styles.title}>
          {title}
        </AppText>

        {showIcons && (
          <View style={styles.iconContainer}>
            <TouchableOpacity
              onPress={handleNotifications}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel={strings.screens.notifications}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSettings}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel={strings.screens.settings}
            >
              <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    padding: 8,
  },
});
