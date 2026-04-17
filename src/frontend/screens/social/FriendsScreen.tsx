import react from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { TopBar } from '../../components/common/TopBar';
import { AppText } from '../../components/common/AppText';

export const FriendsScreen = () => {
	return (
		<View style={styles.wrapper}>
			<TopBar title='Friends' showIcons={true} />
			<ScreenContainer style={styles.container}>
				<AppText color='black' children='Friends Placeholder' variant='default'></AppText>
			</ScreenContainer>
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
