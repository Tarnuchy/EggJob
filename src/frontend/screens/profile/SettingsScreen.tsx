import react from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppText } from '../../components/common/AppText';

export const SettingsScreen = () => {
	return (
		<ScreenContainer style={styles.container}>
			<AppText color='black' children='Settings Placeholder' variant='default'></AppText>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
