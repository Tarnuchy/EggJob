import react from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppText } from '../../components/common/AppText';
import { colors } from '../../theme/colors';

export const NotificationScreen = () => {
	return (
		<ScreenContainer style={styles.container}>
			<AppText color={colors.textPrimary} children='Notifications Placeholder' variant='default'></AppText>
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
