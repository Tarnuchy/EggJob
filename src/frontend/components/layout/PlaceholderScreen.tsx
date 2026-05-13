import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from './ScreenContainer';
import { TopBar } from './TopBar';
import { AppText } from '../common/AppText';

interface Props {
  text: string;
  title?: string;
  showTopBar?: boolean;
}

export const PlaceholderScreen = ({ text, title, showTopBar = true }: Props) => {
  const body = (
    <ScreenContainer style={styles.container}>
      <AppText color="textPrimary" variant="body">
        {text}
      </AppText>
    </ScreenContainer>
  );

  if (!showTopBar) return body;

  return (
    <View style={styles.wrapper}>
      <TopBar title={title} showIcons={true} />
      {body}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
