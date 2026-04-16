import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRecipeStore } from '../store/recipeStore';

const colors = {
  light: '#FFE1AF',
  mid: '#E2B59A',
  dark: '#B77466',
  text: '#693F27',
  black: '#212121',
};

export default function BakingDetailScreen() {
    const router = useRouter();
    const { id, from, diaryId, title } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('摘要');
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const recipe = useRecipeStore((state) => state.getRecipeById(id));
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
    const satisfactionValue = Number.parseInt(String(recipe?.satisfaction || '0'), 10) || 0;
    const totalStars = 10;
    const displayNote = (recipe?.note || '')
        .split('\n')
        .filter((line) => line && !line.startsWith('分類：') && !line.startsWith('權限：'))
        .join('\n')
        .trim();

    useEffect(() => {
        setCurrentImageIndex(0);
    }, [id]);

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

        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={handleBackPress}>
                        <Image source={require('../img/back.png')} style={styles.headerIcon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{recipe.title}</Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity onPress={() => setIsFavorite((prev) => !prev)}>
                        <Image
                            source={isFavorite ? require('../img/love.png') : require('../img/save.png')}
                            style={[styles.headerIcon, { marginRight: 15 }]}
                        />
                    </TouchableOpacity>
                    <Image source={require('../img/share.png')} style={styles.headerIcon} />
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

                    {/* 食材 Section */}
                    <View style={[styles.section, styles.borderTop]}>
                        <Text style={styles.sectionTitle}>食材</Text>
                        {recipe.ingredients.map((item, index) => (
                            <View key={index} style={styles.listItem}>
                                <View style={styles.dot} />
                                <Text style={styles.listText}>{item.name}  {item.amount}</Text>
                            </View>
                        ))}
                    </View>

                    {/* 作法 Section */}
                    <View style={[styles.section, styles.borderTop]}>
                        <Text style={styles.sectionTitle}>作法</Text>
                        {recipe.steps.map((step, index) => (
                            <Text key={index} style={styles.listText}>{index + 1}. {step}</Text>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* 5. Bottom Navigation (與 index 一致) */}
            <View style={styles.navContainer}>
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}>
                        <Image source={require('../img/home.png')} style={styles.navIcon} />
                        <Text style={styles.navText}>首頁</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/favorite')}>
                        <Image source={require('../img/favorite.png')} style={styles.navIcon} />
                        <Text style={styles.navText}>收藏</Text>
                    </TouchableOpacity>
                    <View style={{ width: 80 }} />
                    <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/diary')}>
                        <Image source={require('../img/gallery.png')} style={styles.navIcon} />
                        <Text style={styles.navText}>日誌本</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/member')}>
                        <Image source={require('../img/member.png')} style={styles.navIcon} />
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
    container: { flex: 1, backgroundColor: colors.light },
    scrollContent: { paddingBottom: 110 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerIcon: { width: 28, height: 28 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginLeft: 8 },
    headerIcons: { flexDirection: 'row' },
    imagePlaceholder: {
        height: 250,
        backgroundColor: colors.light,
        justifyContent: 'center',
        alignItems: 'center'
    },
    noImageBox: {
        width: '100%',
        height: '100%',
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#5D4037',
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
    tabText: { fontSize: 16, color: '#8D6E63' },
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
    starFilled: { color: '#F5A623' },
    starEmpty: { color: '#B0A9A5' },
    infoText: { fontSize: 16, color: '#3E2723', marginBottom: 5 },
    dateText: { fontSize: 12, color: '#8D6E63', marginTop: 5 },
    borderTop: { borderTopWidth: 1, borderTopColor: colors.dark, paddingTop: 20 },
    listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: colors.text, marginRight: 10 },
    listText: { fontSize: 16, color: '#3E2723' },
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
        backgroundColor: colors.black,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusIcon: { width: 30, height: 30 }
});