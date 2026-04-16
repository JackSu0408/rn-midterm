import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

const colors = {
	light: '#FFE1AF',
	mid: '#E2B59A',
	dark: '#B77466',
	text: '#693F27',
	black: '#212121',
};

const DIARY_DETAIL_MAP = {
	'1': {
		title: '巴斯克蛋糕',
		image: require('../img/basque.png'),
		detailId: 'diary-basque',
	},
	'2': {
		title: '紐約重乳酪',
		image: require('../img/cheesecake.png'),
		detailId: 'diary-cheesecake',
	},
};

const buildHistoryRecords = (diaryId, title) => {
	const recipe = DIARY_DETAIL_MAP[String(diaryId)] || {
		title: title || '甜點紀錄',
		image: null,
		detailId: '1',
	};

	const now = new Date('2026-04-09');
	return Array.from({ length: 12 }, (_, index) => {
		const date = new Date(now);
		date.setDate(now.getDate() - index);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return {
			id: `log-${index + 1}`,
			title: recipe.title,
			date: `${year}.${month}.${day}`,
			image: recipe.image,
			detailId: recipe.detailId,
		};
	});
};

export default function DiaryLogScreen() {
	const router = useRouter();
	const { diaryId, title } = useLocalSearchParams();

	const historyRecords = useMemo(() => buildHistoryRecords(diaryId, title), [diaryId, title]);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Image source={require('../img/back.png')} style={styles.headerBackIcon} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{title || '甜點紀錄'}</Text>
			</View>

			<View style={styles.sortRow}>
				<View style={styles.sortBadge}>
					<Text style={styles.sortText}>- 由新到舊</Text>
				</View>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.gridContent}
			>
				{historyRecords.map((record) => (
					<TouchableOpacity
						key={record.id}
						activeOpacity={0.88}
						style={styles.recordCard}
						onPress={() =>
							router.push({
								pathname: '/detail',
								params: {
									id: record.detailId,
									from: 'diaryLog',
									diaryId,
									title,
								},
							})
						}
					>
						{record.image ? (
							<Image source={record.image} style={styles.cardImage} />
						) : (
							<View style={styles.placeholderBox}>
								<Text style={styles.placeholderText}>暫無圖片</Text>
							</View>
						)}
						<Text style={styles.recordTitle} numberOfLines={1}>
							{record.title}
						</Text>
						<Text style={styles.recordDate}>{record.date}</Text>
					</TouchableOpacity>
				))}
			</ScrollView>

			<View style={styles.navContainer}>
				<View style={styles.bottomNav}>
					<TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}>
						<Image source={require('../img/home.png')} style={styles.icon} />
						<Text style={styles.navText}>首頁</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.navItem} onPress={() => router.replace('/favorite')}>
						<Image source={require('../img/favorite.png')} style={styles.icon} />
						<Text style={styles.navText}>收藏</Text>
					</TouchableOpacity>
					<View style={{ width: 80 }} />
					<TouchableOpacity style={styles.navItem} onPress={() => router.replace('/diary')}>
						<Image source={require('../img/gallery.png')} style={styles.icon} />
						<Text style={styles.navText}>日誌本</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.navItem} onPress={() => router.replace('/member')}>
						<Image source={require('../img/member.png')} style={styles.icon} />
						<Text style={styles.navText}>我的</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity style={styles.plusButton} onPress={() => router.push('/record')}>
					<Image source={require('../img/add.png')} style={styles.plusIcon} />
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.light,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
	},
	headerBackIcon: {
		width: 28,
		height: 28,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#5D4037',
		marginLeft: 8,
	},
	sortRow: {
		paddingHorizontal: 20,
		marginBottom: 10,
	},
	sortBadge: {
		alignSelf: 'flex-start',
		borderWidth: 1,
		borderColor: '#D7CCC8',
		paddingHorizontal: 8,
		paddingVertical: 3,
		backgroundColor: '#FFF7EB',
		borderRadius: 4,
	},
	sortText: {
		color: '#5D4037',
		fontSize: 14,
	},
	gridContent: {
		paddingHorizontal: 20,
		paddingBottom: 110,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	recordCard: {
		width: '31%',
		backgroundColor: '#FFFFFF',
		borderRadius: 8,
		marginBottom: 14,
		paddingVertical: 10,
		alignItems: 'center',
	},
	placeholderBox: {
		width: 72,
		height: 72,
		backgroundColor: '#D9D9D9',
		borderRadius: 6,
		justifyContent: 'center',
		alignItems: 'center',
	},
	cardImage: {
		width: 72,
		height: 72,
		borderRadius: 6,
		resizeMode: 'cover',
	},
	placeholderText: {
		fontSize: 10,
		color: '#666666',
	},
	recordTitle: {
		marginTop: 7,
		fontSize: 13,
		color: '#4E342E',
		fontWeight: '600',
		width: '90%',
		textAlign: 'center',
	},
	recordDate: {
		marginTop: 2,
		fontSize: 10,
		color: '#8D6E63',
	},
	navContainer: {
		alignItems: 'center',
		position: 'absolute',
		bottom: 0,
		width: '100%',
	},
	bottomNav: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: colors.dark,
		paddingVertical: 12,
		paddingHorizontal: 15,
		width: '100%',
		height: 70,
	},
	navItem: {
		alignItems: 'center',
		flex: 1,
	},
	navText: {
		color: 'white',
		fontSize: 12,
		marginTop: 4,
	},
	icon: {
		width: 24,
		height: 24,
	},
	plusButton: {
		position: 'absolute',
		top: -25,
		backgroundColor: colors.black,
		width: 50,
		height: 50,
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
	},
	plusIcon: {
		width: 30,
		height: 30,
	},
});
