import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppText } from './AppText';

interface Props {
    message?: string;
    color?: string;
    size?: 'small' | 'large';
    fullscreen?: boolean;
}

export const LoadingIndicator = ({
    message = 'Loading...',
    color = '#007AFF',
    size = 'large',
    fullscreen = false,
}: Props) => {
    return (
        <View style={[styles.container, fullscreen && styles.fullscreen]}>
            <ActivityIndicator size={size} color={color} />
            {message ? (
                <AppText color='black' variant='default' style={styles.message}>
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
