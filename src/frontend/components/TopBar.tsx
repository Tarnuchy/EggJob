import react from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import { AppText } from './AppText';

interface TopBarProps {
	title?: string;
	showIcons?: boolean;
}

export const TopBar = ({ title = '', showIcons = true }: TopBarProps) => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const androidTopInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

	const handleNotifications = () => {
		navigation.navigate('Notifications');
	};

	const handleSettings = () => {
		navigation.navigate('Settings');
	};

	return (
		<SafeAreaView style={[styles.safeArea, { paddingTop: androidTopInset }]}>
			<View style={styles.topBar}>
				<AppText color='black' children={title} variant='default' style={styles.title}></AppText>

				{showIcons && (
					<View style={styles.iconContainer}>
						<TouchableOpacity onPress={handleNotifications} style={styles.iconButton}>
							<AppText color='black' children='🔔' variant='default' style={styles.icon}></AppText>
						</TouchableOpacity>
						<TouchableOpacity onPress={handleSettings} style={styles.iconButton}>
							<AppText color='black' children='⚙️' variant='default' style={styles.icon}></AppText>
						</TouchableOpacity>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		backgroundColor: '#fff',
	},
	topBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	title: {
		fontSize: 20,
		fontWeight: '600',
	},
	iconContainer: {
		flexDirection: 'row',
		gap: 15,
	},
	iconButton: {
		padding: 8,
	},
	icon: {
		fontSize: 20,
	},
});