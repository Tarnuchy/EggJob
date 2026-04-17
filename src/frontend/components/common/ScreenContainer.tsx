import react from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
    children?: React.ReactNode;
    style?: ViewStyle;
}

export const ScreenContainer = ({ children, style }: Props) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.container, style]}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
});