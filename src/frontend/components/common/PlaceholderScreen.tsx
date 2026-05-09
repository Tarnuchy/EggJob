import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from './ScreenContainer';
import { TopBar } from './TopBar';
import { AppText } from './AppText';
import { colors } from '../../theme/colors';

interface Props {
    placeholderText: string;
    title?: string;
    showTopBar?: boolean;
}

export const PlaceholderScreen = ({ placeholderText, title, showTopBar = false }: Props) => {
    const body = (
        <ScreenContainer style={styles.container}>
            <AppText color={colors.textPrimary} variant="default">
                {placeholderText}
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
