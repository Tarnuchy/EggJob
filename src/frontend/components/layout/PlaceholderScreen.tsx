import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from './ScreenContainer';
import { TopBar } from './TopBar';
import { AppText } from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface Props {
  text: string;
  title?: string;
  showTopBar?: boolean;
}

export const PlaceholderScreen = ({ text, title, showTopBar = true }: Props) => {
  const body = (
    <ScreenContainer style={styles.container} edges={['left', 'right']}>
      {title && (
        <AppText variant="h1" color="textPrimary" style={styles.title}>
          {title}
        </AppText>
      )}
      <AppText variant="body" color="textSecondary">
        {text}
      </AppText>
    </ScreenContainer>
  );

  if (!showTopBar) return body;

  return (
    <View style={styles.wrapper}>
      <TopBar />
      {body}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.md,
  },
});
