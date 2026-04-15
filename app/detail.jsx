import React, { useState } from 'react';
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

const DETAIL_DATA = {
    '1': {
        title: '布朗尼',
        image: require('../img/brownie.png'),
        userName: 'RWei',
        userAvatar: require('../img/Meeeee.png'),
        satisfaction: '8★',
        note: '外酥內軟、巧克力香氣濃郁。',
        date: '2026.04.09',
        ingredients: [
            { name: '黑巧克力', amount: '200g' },
            { name: '奶油', amount: '120g' },
            { name: '低筋麵粉', amount: '80g' },
        ],
        steps: ['巧克力與奶油隔水加熱融化。', '拌入材料後以 170°C 烘烤約 25 分鐘。'],
    },
    '2': {
        title: '戚風蛋糕',
        image: require('../img/chiffon.png'),
        userName: 'XEX',
        userAvatar: require('../img/Meeeee.png'),
        satisfaction: '9★',
        note: '口感輕盈，回彈很好。',
        date: '2026.04.03',
        ingredients: [
            { name: '蛋', amount: '4 顆' },
            { name: '細砂糖', amount: '70g' },
            { name: '低筋麵粉', amount: '90g' },
        ],
        steps: ['蛋白打發至乾性發泡。', '與蛋黃麵糊拌勻後 160°C 烘烤 35 分鐘。'],
    },
    '3': {
        title: '聖諾多黑',
        image: require('../img/puff.png'),
        userName: 'King',
        userAvatar: require('../img/Meeeee.png'),
        satisfaction: '7★',
        note: '焦糖上色漂亮，卡士達可再更濃。',
        date: '2026.04.01',
        ingredients: [
            { name: '泡芙麵糊', amount: '1 份' },
            { name: '卡士達醬', amount: '250g' },
            { name: '焦糖', amount: '適量' },
        ],
        steps: ['先烤泡芙並填入卡士達。', '表面沾焦糖後組裝完成。'],
    },
    r1: {
        title: '磅蛋糕',
        image: require('../img/poundcake.png'),
        userName: 'CuCu',
        userAvatar: require('../img/Meeeee.png'),
        satisfaction: '8★',
        note: '奶油香足，組織紮實濕潤。',
        date: '2026.03.29',
        ingredients: [
            { name: '奶油', amount: '150g' },
            { name: '細砂糖', amount: '120g' },
            { name: '蛋', amount: '3 顆' },
        ],
        steps: ['奶油與糖打發後分次加蛋。', '拌入粉類後 170°C 烘烤 45 分鐘。'],
    },
    r2: {
        title: '蘋果奶酥',
        image: require('../img/crumble.png'),
        userName: 'Qian',
        userAvatar: require('../img/Meeeee.png'),
        satisfaction: '9★',
        note: '酸甜平衡，奶酥酥脆。',
        date: '2026.03.29',
        ingredients: [
            { name: '蘋果', amount: '2 顆' },
            { name: '奶酥粒', amount: '150g' },
            { name: '肉桂粉', amount: '少許' },
        ],
        steps: ['蘋果切丁拌糖與肉桂。', '鋪上奶酥後 180°C 烘烤 30 分鐘。'],
    },
    r3: {
        title: '軟餅乾',
        image: require('../img/cookies.png'),
        userName: 'JackSu',
        userAvatar: require('../img/Meeeee.png'),
        satisfaction: '8★',
        note: '邊緣微酥，中心柔軟。',
        date: '2026.03.28',
        ingredients: [
            { name: '無鹽奶油', amount: '100g' },
            { name: '黑糖', amount: '80g' },
            { name: '巧克力豆', amount: '100g' },
        ],
        steps: ['材料拌勻後冷藏 20 分鐘。', '180°C 烘烤 10-12 分鐘。'],
    },
};

export default function BakingDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('摘要');
    const recipe = DETAIL_DATA[id] || DETAIL_DATA['1'];

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerLeft} onPress={() => router.replace('/')}>
                    <Image source={require('../img/back.png')} style={styles.headerIcon} />
                    <Text style={styles.headerTitle}>{recipe.title}</Text>
                </TouchableOpacity>
                <View style={styles.headerIcons}>
                    <Image source={require('../img/favorite.png')} style={[styles.headerIcon, { marginRight: 15 }]} />
                    <Image source={require('../img/share.png')} style={styles.headerIcon} />
                </View>
            </View>

            <ScrollView stickyHeaderIndices={[2]} showsVerticalScrollIndicator={false}>
                {/* 2. Image Area */}
                <View style={styles.imagePlaceholder}>
                    <Image source={recipe.image} style={styles.mainImage} />
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
                        <Text style={styles.infoText}>滿意度：{recipe.satisfaction}</Text>
                        <Text style={styles.infoText}>備註：{recipe.note}</Text>
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
                    <TouchableOpacity style={styles.navItem} onPress={() => {}}>
                        <Image source={require('../img/favorite.png')} style={styles.navIcon} />
                        <Text style={styles.navText}>收藏</Text>
                    </TouchableOpacity>
                    <View style={{ width: 80 }} />
                    <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/diary')}>
                        <Image source={require('../img/gallery.png')} style={styles.navIcon} />
                        <Text style={styles.navText}>日誌本</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => {}}>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerIcon: { width: 28, height: 28 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginLeft: 8 },
    headerIcons: { flexDirection: 'row' },
    imagePlaceholder: {
        height: 250,
        backgroundColor: colors.light,
        borderBottomColor: colors.text,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.light,
        borderBottomWidth: 1,
        borderBottomColor: colors.text
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
    infoText: { fontSize: 16, color: '#3E2723', marginBottom: 5 },
    dateText: { fontSize: 12, color: '#8D6E63', marginTop: 5 },
    borderTop: { borderTopWidth: 1, borderTopColor: colors.text, paddingTop: 20 },
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