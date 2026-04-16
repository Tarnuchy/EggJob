import react from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

// to do jakis malych bledow do wiekszych bledow ze wyskoczy okienko bedzie GlobalModal

interface Props {
    message: string;
    visible: boolean;
}

export const ErrorMessage = ({ message, visible }: Props) => {
  if (!visible) return null;
  return <Text style={styles.errorText}>{message}</Text>;
};

// Do ustalenia jak to ma wygladac
const styles = StyleSheet.create({
  errorText: {
  },
});