import { Text, StyleSheet } from 'react-native';

interface Props {
    message?: string;
    visible?: boolean;
}

export const ErrorMessage = ({ message, visible }: Props) => {
  if (!visible) return null;
  return <Text style={styles.errorText}>{message}</Text>;
};

const styles = StyleSheet.create({
  errorText: {},
});