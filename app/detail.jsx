import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, Modal, StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRecipeStore } from '../store/recipeStore';
import { useThemeColors } from '../store/themeStore';
import { getIcon } from '../utils/icons';
import AnimatedHeartButton from '../components/AnimatedHeartButton';

export default function BakingDetailScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const styles = createStyles(colors);
    const { id, from, diaryId, title } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('摘要');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [previewImage, setPreviewImage] = useState(null);
    const recipe = useRecipeStore((state) => state.getRecipeById(id));
    const isFavorite = useRecipeStore((state) => state.favorites.includes(String(recipe?.id)));
    const toggleFavorite = useRecipeStore((state) => state.toggleFavorite);
    const screenWidth = Dimensions.get('window').width;
    const detailImages = useMemo(() => {
        if (Array.isArray(recipe?.images) && recipe.images.length > 0) {
            return recipe.images;
        }
        if (recipe?.image) {
            return [recipe.image];
        }
        return [];
    }, [recipe]);
    const MAX_STARS = 5;
    const rawSatisfaction = Number.parseInt(String(recipe?.satisfaction || '0'), 10) || 0;
    // 舊資料以 10 顆星為基準，換算成統一的 5 顆星顯示
    const satisfactionValue = rawSatisfaction > MAX_STARS
        ? Math.round((rawSatisfaction / 10) * MAX_STARS)
        : rawSatisfaction;
    const totalStars = MAX_STARS;
    const displayNote = (recipe?.note || '')
        .split('\n')
        .filter((line) => line && !line.startsWith('分類：') && !line.startsWith('權限：'))
        .join('\n')
        .trim();

    useEffect(() => {
        setCurrentImageIndex(0);
    }, [id]);

    if (!recipe) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
                            <Image source={getIcon('back', colors.mode)} style={styles.headerIcon} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>找不到食譜</Text>
                    </View>
                </View>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>這個食譜不存在或已被刪除。</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleEditPress = () => {
        const recipeId = Array.isArray(id) ? id[0] : id;
        if (!recipeId) {
            return;
        }
        router.push({
            pathname: '/record',
            params: { editId: recipeId },
        });
    };

    const handleBackPress = () => {
        if (from === 'diaryLog') {
            router.replace({
                pathname: '/diaryLog',
                params: {
                    diaryId,
                    title,
                },
            });
            return;
        }

        if (router.canGoBack()) {
            router.back();
            return;
        }

        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={handleBackPress}>
                        <Image source={getIcon('back', colors.mode)} style={styles.headerIcon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{recipe.title}</Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.headerIconButton} onPress={handleEditPress}>
                        <Image source={getIcon('edit', colors.mode)} style={styles.headerIcon} />
                    </TouchableOpacity>
                    <AnimatedHeartButton
                        style={styles.headerIconButton}
                        isFavorite={isFavorite}
                        onPress={() => toggleFavorite(recipe.id)}
                        iconStyle={styles.headerIcon}
                    />
                    <TouchableOpacity style={styles.headerIconButton} onPress={() => Alert.alert('分享', '分享功能尚未開放。')}>
                        <Image source={getIcon('share', colors.mode)} style={styles.headerIcon} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                stickyHeaderIndices={[2]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 2. Image Area */}
                <View style={styles.imagePlaceholder}>
                    {detailImages.length > 0 ? (
                        <>
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={(event) => {
                                    const width = event.nativeEvent.layoutMeasurement.width || screenWidth;
                                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                                    setCurrentImageIndex(index);
                                }}
                            >
                                {detailImages.map((imageSource, index) => (
                                    <Image
                                        key={`detail-image-${index}`}
                                        source={imageSource}
                                        style={[styles.mainImage, { width: screenWidth }]}
                                    />
                                ))}
                            </ScrollView>
                            {detailImages.length > 1 && (
                                <View style={styles.carouselDots}>
                                    {detailImages.map((_, index) => (
                                        <View
                                            key={`detail-dot-${index}`}
                                            style={[
                                                styles.carouselDot,
                                                index === currentImageIndex && styles.carouselDotActive,
                                            ]}
                                        />
                                    ))}
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={styles.noImageBox}>
                            <Text style={styles.noImageText}>暫無圖片</Text>
                        </View>
                    )}
                </View>

                {/* 3. Segmented Tabs */}
                <View style={styles.tabContainer}>
                    {['摘要', '食材', '作法'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 4. Content Area */}
                <View style={styles.contentSection}>
                    {/* 用戶資訊區 */}
                    <View style={styles.userRow}>
                        <Image source={recipe.userAvatar} style={styles.avatar} />
                        <Text style={styles.userName}>{recipe.userName}</Text>
                    </View>

                    {/* 摘要 Section */}
                    {activeTab === '摘要' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>摘要</Text>
                            <View style={styles.satisfactionRow}>
                                <Text style={styles.infoText}>滿意度：</Text>
                                <View style={styles.satisfactionStars}>
                                    {Array.from({ length: totalStars }, (_, index) => {
                                        const starValue = index + 1;
                                        const isFilled = starValue <= satisfactionValue;
                                        return (
                                            <Text
                                                key={`detail-star-${starValue}`}
                                                style={[styles.satisfactionStar, isFilled ? styles.starFilled : styles.starEmpty]}
                                            >
                                                {isFilled ? '★' : '☆'}
                                            </Text>
                                        );
                                    })}
                                </View>
                            </View>
                            <Text style={styles.infoText}>備註：{displayNote || '未填寫備註'}</Text>
                            <Text style={styles.dateText}>{recipe.date}</Text>
                        </View>
                    )}

                    {/* 食材 Section */}
                    {activeTab === '食材' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>食材</Text>
                            {recipe.ingredients.map((item, index) => (
                                <View key={index} style={styles.listItem}>
                                    <View style={styles.dot} />
                                    <Text style={styles.listText}>{item.name}  {item.amount}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* 作法 Section */}
                    {activeTab === '作法' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>作法</Text>
                            {recipe.steps.map((step, index) => {
                                const stepImage = recipe.stepImages?.[index];
                                const stepImageSource = stepImage
                                    ? (typeof stepImage === 'number' ? stepImage : { uri: stepImage.uri })
                                    : null;
                                return (
                                    <View key={index} style={styles.stepRow}>
                                        <Text style={styles.listText}>{index + 1}. {step}</Text>
                                        {stepImageSource && (
                                            <TouchableOpacity onPress={() => setPreviewImage(stepImageSource)}>
                                                <Image source={stepImageSource} style={styles.stepImage} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* 5. Bottom Navigation (與 index 一致) */}
            <View style={styles.navContainer}>
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}>
                        <Image source={getIcon('home', colors.mode)} style={styles.navIcon} />
                        <Text style={styles.navText}>首頁</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/favorite')}>
                        <Image source={getIcon('favorite', colors.mode)} style={styles.navIcon} />
                        <Text style={styles.navText}>收藏</Text>
                    </TouchableOpacity>
                    <View style={{ width: 80 }} />
                    <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/diary')}>
                        <Image source={getIcon('gallery', colors.mode)} style={styles.navIcon} />
                        <Text style={styles.navText}>日誌本</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/member')}>
                        <Image source={getIcon('profile', colors.mode)} style={styles.navIcon} />
                        <Text style={styles.navText}>我的</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.plusButton} onPress={() => router.push('/record')}>
                    <Image source={getIcon('add', 'dark')} style={styles.plusIcon} />
                </TouchableOpacity>
            </View>

            {/* 作法圖片預覽 Modal */}
            <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
                <TouchableOpacity
                    style={styles.previewOverlay}
                    activeOpacity={1}
                    onPress={() => setPreviewImage(null)}
                >
                    {previewImage && (
                        <Image source={previewImage} style={styles.previewImage} resizeMode="contain" />
                    )}
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light },
    scrollContent: { paddingBottom: 110 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    emptyText: { fontSize: 16, color: colors.subtleText, textAlign: 'center' },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerIcon: { width: 28, height: 28 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginLeft: 8 },
    headerIcons: { flexDirection: 'row', alignItems: 'center' },
    headerIconButton: {
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 2,
    },
    imagePlaceholder: {
        height: 250,
        backgroundColor: colors.light,
        justifyContent: 'center',
        alignItems: 'center'
    },
    noImageBox: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.placeholder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: colors.subtleText,
        fontSize: 16,
        fontWeight: '600',
    },
    carouselDots: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.55)',
        marginHorizontal: 3,
    },
    carouselDotActive: {
        backgroundColor: '#FFFFFF',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.light,
        borderBottomWidth: 1,
        borderBottomColor: colors.dark
    },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    activeTabButton: { borderBottomWidth: 0 },
    tabText: { fontSize: 16, color: colors.muted },
    activeTabText: { color: colors.mid, fontWeight: 'bold' },
    contentSection: { padding: 20 },
    userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.text },
    userName: { marginLeft: 15, fontSize: 16, fontWeight: 'bold', color: colors.text },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
    satisfactionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' },
    satisfactionStars: { flexDirection: 'row', alignItems: 'center' },
    satisfactionStar: { fontSize: 18, marginRight: 1 },
    starFilled: { color: colors.accentOrange },
    starEmpty: { color: colors.gray },
    infoText: { fontSize: 16, color: colors.deepText, marginBottom: 5 },
    dateText: { fontSize: 12, color: colors.muted, marginTop: 5 },
    listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: colors.text, marginRight: 10 },
    listText: { fontSize: 16, color: colors.deepText },
    stepRow: { marginBottom: 12 },
    stepImage: {
        width: '100%',
        height: 160,
        borderRadius: 8,
        marginTop: 8,
        resizeMode: 'cover',
    },
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    // Bottom Nav Styles
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
    navItem: { alignItems: 'center', flex: 1 },
    navText: { color: 'white', fontSize: 12, marginTop: 4 },
    navIcon: { width: 24, height: 24 },
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
    plusIcon: { width: 30, height: 30 }
});