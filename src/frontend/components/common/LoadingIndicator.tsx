import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from './AppText';
import { colors } from '../../theme/colors';

interface Props {
  message?: string;
  color?: string;
  size?: 'small' | 'large';
  fullscreen?: boolean;
}

export const LoadingIndicator = ({
  message,
  color = colors.primary,
  size = 'large',
  fullscreen = false,
}: Props) => {
  const { t } = useTranslation();
  const text = message ?? t('common.loading');
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size={size} color={color} />
      {text ? (
        <AppText color="textPrimary" variant="body" style={styles.message}>
          {text}
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
