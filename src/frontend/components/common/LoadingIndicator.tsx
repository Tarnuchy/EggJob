import react from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppText } from './AppText';

interface Props {
    message: string;
    color: string;
    size : 'small' | 'large';
    fullscreen: boolean;
}

//Lowkey TODO ale nie wiem czy to w ogole potrzebne bedzie do zastanowienia szczerze
//Na razie niech bedzie puste ewentualnie dopisze
