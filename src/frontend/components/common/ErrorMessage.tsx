import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
    message?: string;
    visible?: boolean;
}

export const ErrorMessage = ({ message, visible }: Props) => {
  if (!visible) return null;
  return <Text style={styles.errorText}>{message}</Text>;
};

const styles = StyleSheet.create({
  errorText: {
    marginTop: 6,
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
  },
});