import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { strings } from '../../i18n/strings';
import { colors } from '../../theme/colors';

interface Props {
  message?: string;
  color?: string;
  size?: 'small' | 'large';
  fullscreen?: boolean;
}

export const LoadingIndicator = ({
  message = strings.common.loading,
  color = colors.primary,
  size = 'large',
  fullscreen = false,
}: Props) => {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size={size} color={color} />
      {message ? (
        <AppText color="textPrimary" variant="body" style={styles.message}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreen: {
    flex: 1,
  },
  message: {
    marginTop: 8,
  },
});
