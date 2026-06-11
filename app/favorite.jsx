import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../store/recipeStore';
import { useThemeColors } from '../store/themeStore';
import { getIcon } from '../utils/icons';
import AnimatedTouchable from '../components/AnimatedTouchable';

export default function FavoriteScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const styles = createStyles(colors);
    const recipes = useRecipeStore((state) => state.recipes);
    const favorites = useRecipeStore((state) => state.favorites);

    const favoriteRecipes = useMemo(
        () => favorites.map((id) => recipes[id]).filter(Boolean),
        [favorites, recipes]
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
                    <Image source={getIcon('back', colors.mode)} style={styles.headerBackIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>收藏</Text>
            </View>

            {favoriteRecipes.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>還沒有收藏的食譜</Text>
                    <Text style={styles.emptyHint}>在食譜詳情頁按下愛心，即可收藏在這裡</Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.gridContent}
                >
                    {favoriteRecipes.map((recipe, index) => (
                        <AnimatedTouchable
                            key={recipe.id}
                            style={[styles.recordCard, (index + 1) % 3 !== 0 && styles.recordCardSpacing]}
                            onPress={() => router.push({ pathname: '/detail', params: { id: recipe.id } })}
                        >
                            {recipe.image ? (
                                <Image source={recipe.image} style={styles.cardImage} />
                            ) : (
                                <View style={styles.placeholderBox}>
                                    <Text style={styles.placeholderText}>暫無圖片</Text>
                                </View>
                            )}
                            <Text style={styles.recordTitle} numberOfLines={1}>
                                {recipe.title}
                            </Text>
                            <Text style={styles.recordDate}>{recipe.date}</Text>
                        </AnimatedTouchable>
                    ))}
                </ScrollView>
            )}

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
