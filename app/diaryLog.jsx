import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRecipeStore } from '../store/recipeStore';
import { useThemeColors } from '../store/themeStore';
import { getIcon } from '../utils/icons';
import AnimatedTouchable from '../components/AnimatedTouchable';

export default function DiaryLogScreen() {
	const router = useRouter();
	const colors = useThemeColors();
	const styles = createStyles(colors);
	const { diaryId, title } = useLocalSearchParams();
	const recipes = useRecipeStore((state) => state.recipes);
	const addRecipeToDiary = useRecipeStore((state) => state.addRecipeToDiary);
	const removeRecipeFromDiary = useRecipeStore((state) => state.removeRecipeFromDiary);
	const [isPickerOpen, setIsPickerOpen] = useState(false);

	const normalizedDiaryId = Array.isArray(diaryId) ? diaryId[0] : diaryId;
	const diary = normalizedDiaryId ? recipes[normalizedDiaryId] : null;
	const diaryRecipeIds = diary?.recipeIds || [];

	const historyRecords = useMemo(() => {
		return diaryRecipeIds
			.map((id) => recipes[id])
			.filter(Boolean)
			.map((recipe) => ({
				id: recipe.id,
				title: recipe.title,
				date: recipe.date,
				image: recipe.image,
				detailId: recipe.id,
			}));
	}, [recipes, diaryRecipeIds]);

	const availableRecipes = useMemo(() => {
		return Object.values(recipes).filter(
			(recipe) =>
				recipe &&
				recipe.userName === 'Me' &&
				recipe.category != null &&
				!diaryRecipeIds.includes(recipe.id)
		);
	}, [recipes, diaryRecipeIds]);

	const handleAddRecipe = (recipeId) => {
		addRecipeToDiary(normalizedDiaryId, recipeId);
		setIsPickerOpen(false);
	};

	const handleRemoveRecipe = (recipe) => {
		Alert.alert('移除紀錄', `確定要將「${recipe.title}」從日誌本中移除嗎？`, [
			{ text: '取消', style: 'cancel' },
			{
				text: '移除',
				style: 'destructive',
				onPress: () => removeRecipeFromDiary(normalizedDiaryId, recipe.id),
			},
		]);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
					<Image source={getIcon('back', colors.mode)} style={styles.headerBackIcon} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{title || '甜點紀錄'}</Text>
				<TouchableOpacity style={styles.addRecipeButton} onPress={() => setIsPickerOpen(true)}>
					<Image source={getIcon('add', colors.mode)} style={styles.addRecipeIcon} />
					<Text style={styles.addRecipeText}>加入食譜</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.sortRow}>
				<View style={styles.sortBadge}>
					<Text style={styles.sortText}>- 由新到舊</Text>
				</View>
			</View>

			{historyRecords.length === 0 ? (
				<View style={styles.emptyState}>
					<Text style={styles.emptyTitle}>還沒有烘焙紀錄</Text>
					<Text style={styles.emptyHint}>點擊上方「加入食譜」將食譜加入這個日誌本</Text>
				</View>
			) : (
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.gridContent}
			>
				{historyRecords.map((record, index) => (
					<AnimatedTouchable
						key={record.id}
						style={[styles.recordCard, (index + 1) % 3 !== 0 && styles.recordCardSpacing]}
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
						onLongPress={() => handleRemoveRecipe(record)}
						delayLongPress={350}
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
					</AnimatedTouchable>
				))}
			</ScrollView>
			)}

			<Modal
				visible={isPickerOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsPickerOpen(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>選擇要加入的食譜</Text>
						{availableRecipes.length === 0 ? (
							<Text style={styles.modalEmptyText}>沒有可加入的食譜</Text>
						) : (
							<ScrollView style={styles.modalList}>
								{availableRecipes.map((recipe) => (
									<TouchableOpacity
										key={recipe.id}
										style={styles.modalOption}
										onPress={() => handleAddRecipe(recipe.id)}
									>
										{recipe.image ? (
											<Image source={recipe.image} style={styles.modalOptionImage} />
										) : (
											<View style={styles.modalOptionPlaceholder}>
												<Text style={styles.placeholderText}>暫無圖片</Text>
											</View>
										)}
										<Text style={styles.modalOptionText} numberOfLines={1}>
											{recipe.title}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						)}
						<TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsPickerOpen(false)}>
							<Text style={styles.modalCloseText}>關閉</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{!isPickerOpen && (
				<View style={styles.navContainer}>
					<View style={styles.bottomNav}>
						<TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}>
							<Image source={getIcon('home', colors.mode)} style={styles.icon} />
							<Text style={styles.navText}>首頁</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.navItem} onPress={() => router.replace('/favorite')}>
							<Image source={getIcon('favorite', colors.mode)} style={styles.icon} />
							<Text style={styles.navText}>收藏</Text>
						</TouchableOpacity>
						<View style={{ width: 80 }} />
						<TouchableOpacity style={styles.navItem} onPress={() => router.replace('/diary')}>
							<Image source={getIcon('gallery', colors.mode)} style={styles.icon} />
							<Text style={styles.navText}>日誌本</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.navItem} onPress={() => router.replace('/member')}>
							<Image source={getIcon('profile', colors.mode)} style={styles.icon} />
							<Text style={styles.navText}>我的</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity style={styles.plusButton} onPress={() => router.push('/record')}>
						<Image source={getIcon('add', 'dark')} style={styles.plusIcon} />
					</TouchableOpacity>
				</View>
			)}
		</SafeAreaView>
	);
}

const createStyles = (colors) => StyleSheet.create({
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
		color: colors.subtleText,
		marginLeft: 8,
		flex: 1,
	},
	addRecipeButton: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: colors.surfaceAlt,
	},
	addRecipeIcon: {
		width: 16,
		height: 16,
		marginRight: 4,
		resizeMode: 'contain',
	},
	addRecipeText: {
		fontSize: 13,
		color: colors.subtleText,
		fontWeight: '600',
	},
	sortRow: {
		paddingHorizontal: 20,
		marginBottom: 10,
	},
	sortBadge: {
		alignSelf: 'flex-start',
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: 8,
		paddingVertical: 3,
		backgroundColor: colors.surfaceAlt,
		borderRadius: 4,
	},
	sortText: {
		color: colors.subtleText,
		fontSize: 14,
	},
	gridContent: {
		paddingHorizontal: 20,
		paddingBottom: 110,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
	},
	recordCard: {
		width: '31%',
		backgroundColor: colors.surface,
		borderRadius: 8,
		marginBottom: 14,
		paddingVertical: 10,
		alignItems: 'center',
	},
	recordCardSpacing: {
		marginRight: '3.5%',
	},
	placeholderBox: {
		width: 72,
		height: 72,
		backgroundColor: colors.placeholder,
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
		color: colors.grayDark,
	},
	recordTitle: {
		marginTop: 7,
		fontSize: 13,
		color: colors.strongText,
		fontWeight: '600',
		width: '90%',
		textAlign: 'center',
	},
	recordDate: {
		marginTop: 2,
		fontSize: 10,
		color: colors.muted,
		width: '90%',
		textAlign: 'center',
	},

	// 加入食譜 Modal
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalCard: {
		width: '85%',
		maxHeight: '70%',
		backgroundColor: colors.surface,
		borderRadius: 12,
		padding: 20,
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.subtleText,
		marginBottom: 14,
		textAlign: 'center',
	},
	modalEmptyText: {
		fontSize: 14,
		color: colors.muted,
		textAlign: 'center',
		paddingVertical: 20,
	},
	modalList: {
		maxHeight: 320,
	},
	modalOption: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 8,
		borderRadius: 8,
		marginBottom: 6,
		backgroundColor: colors.surfaceAlt,
	},
	modalOptionImage: {
		width: 44,
		height: 44,
		borderRadius: 6,
		marginRight: 12,
	},
	modalOptionPlaceholder: {
		width: 44,
		height: 44,
		borderRadius: 6,
		marginRight: 12,
		backgroundColor: colors.placeholder,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalOptionText: {
		flex: 1,
		fontSize: 14,
		color: colors.subtleText,
		fontWeight: '600',
	},
	modalCloseButton: {
		marginTop: 12,
		backgroundColor: colors.text,
		borderRadius: 30,
		paddingVertical: 12,
		alignItems: 'center',
	},
	modalCloseText: {
		color: colors.mode === 'dark' ? '#000000' : '#FFFFFF',
		fontSize: 15,
		fontWeight: 'bold',
	},
	emptyState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 40,
		paddingBottom: 80,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: colors.subtleText,
		marginBottom: 8,
	},
	emptyHint: {
		fontSize: 14,
		color: colors.muted,
		textAlign: 'center',
		lineHeight: 20,
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
		backgroundColor: colors.fab,
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
