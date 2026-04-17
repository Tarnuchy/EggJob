import react from 'react';
import { Text, StyleSheet, TextProps, TextStyle } from 'react-native';


interface Props extends TextProps {
    children?: React.ReactNode;
    style?: TextStyle | TextStyle[]; // w sumie tutaj mozna dac ? przy style i przyjmie jakies domyslne ale to jeszcze sie musze zastanowic na razie bez
    color?: string; // tutaj tak samo wolalbym tego domyslnego unikac jednak bo to pewnie jakis syf
    variant?: 'default'; // w sumie domyslnie ten default bedzie ale to moze nie pod uzytek tylko test bardziej
}

export const AppText = ({ children, style, color='black' , variant='default'}: Props) => { // w argumencie bedzie tez variant jeszce
    return (
        <Text style={[styles[variant], {color}, style]}>
            {children}
        </Text>
    );
};

// Do ustalenia jak to ma wygladac
const styles = StyleSheet.create({
    default: {
    },
});