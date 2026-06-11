import React, { useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../store/recipeStore';
import { useThemeColors } from '../store/themeStore';
import { getIcon } from '../utils/icons';
import AnimatedTouchable from '../components/AnimatedTouchable';

export default function Index() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const recipes = useRecipeStore((state) => state.recipes);
  const recentOrder = useRecipeStore((state) => state.recentOrder);
  const rankingOrder = useRecipeStore((state) => state.rankingOrder);
  const removeRecipe = useRecipeStore((state) => state.removeRecipe);
  const cardAnimsRef = useRef(new Map());
  const [searchQuery, setSearchQuery] = useState('');

  const getCardAnim = (id) => {
    if (!cardAnimsRef.current.has(id)) {
      cardAnimsRef.current.set(id, new Animated.Value(1));
    }
    return cardAnimsRef.current.get(id);
  };

  const handleDeleteCard = (item) => {
    Alert.alert('刪除卡片', `確定要刪除「${item.title}」嗎？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '確定',
        style: 'destructive',
        onPress: () => {
          const anim = getCardAnim(item.id);
          Animated.timing(anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => removeRecipe(item.id));
        },
      },
    ]);
  };

  // 私人食譜僅本人可見，其他使用者的內容不會出現在公開列表中
  const isVisible = (recipe) => recipe.userName === 'Me' || recipe.permission !== '私人';
  // 日誌本（沒有分類）只會出現在日誌本頁面，不會出現在首頁的食譜卡片中
  const isRecipeCard = (recipe) => recipe.category != null;

  const keyword = searchQuery.trim().toLowerCase();
  const matchesKeyword = (recipe) => !keyword || (recipe.title || '').toLowerCase().includes(keyword);

  const recentDesserts = recentOrder
    .map((id) => recipes[id])
    .filter(Boolean)
    .filter(isVisible)
    .filter(isRecipeCard)
    .filter(matchesKeyword)
    .slice(0, 10);

  const rankingDesserts = rankingOrder
    .map((id) => recipes[id])
    .filter(Boolean)
    .filter(isVisible)
    .filter(isRecipeCard)
    .filter(matchesKeyword);

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Image source={getIcon('search', colors.mode)} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜尋食譜名稱"
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity onPress={() => Alert.alert('通知', '目前沒有新的通知。')}>
          <Image source={getIcon('notification', colors.mode)} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 創作者列表 */}
        <View style={styles.creatorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>

            {/* 新增按鈕 */}
            <View style={styles.addCreator}>
              <Text style={{ fontSize: 20 }}>＋</Text>
            </View>

            {/* 創作者卡片 */}
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.creatorCard}>
                <Image source={require('../img/miffybaby.png')}style={styles.creatorImg} />
                <Text style={styles.creatorText}>author</Text>
              </View>
            ))}

          </ScrollView>
        </View>
        {/* 今日食譜 */}
        <View style={styles.todayCard}>
          <View>
            <Text style={styles.todayTitle}>記錄今日食譜！</Text>
            <Text style={styles.subText}>Record today's recipe!</Text>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/record')}>
              <Text style={styles.buttonText}>馬上建立 →</Text>
            </TouchableOpacity>
          </View>

          <Image source={require('../img/book.png')} style={styles.imagePlaceholder} />
        </View>

        {/* 搜尋結果為空時的提示 */}
        {keyword && recentDesserts.length === 0 && rankingDesserts.length === 0 && (
          <Text style={styles.emptySearchText}>找不到符合「{searchQuery}」的食譜</Text>
        )}

        {/* 近期出爐 */}
        <Text style={styles.sectionTitle}>{keyword ? '搜尋結果' : '近期出爐'}</Text>
        <Text style={styles.sectionHint}>長按卡片可刪除紀錄</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentDesserts.map((item) => {
            const cardAnim = getCardAnim(item.id);
            return (
              <Animated.View
                key={item.id}
                style={{ opacity: cardAnim, transform: [{ scale: cardAnim }] }}
              >
                <AnimatedTouchable
                  style={styles.card}
                  onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}
                  onLongPress={() => handleDeleteCard(item)}
                  delayLongPress={350}
                >
                  {item.image ? (
                    <Image source={item.image} style={styles.cardImg} />
                  ) : (
                    <View style={styles.cardNoImageBox}>
                      <Text style={styles.cardNoImageText}>暫無圖片</Text>
                    </View>
                  )}
                  <Text style={styles.cardText}>{item.title}</Text>
                  <Text style={styles.cardDateText}>{item.date}</Text>
                </AnimatedTouchable>
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* 排行榜 */}
        <Text style={styles.sectionTitle}>{keyword ? '其他符合結果' : '排行榜推薦'}</Text>
        <Text style={styles.sectionHint}>長按卡片可刪除紀錄</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {rankingDesserts.map((item) => {
            const cardAnim = getCardAnim(item.id);
            return (
              <Animated.View
                key={item.id}
                style={{ opacity: cardAnim, transform: [{ scale: cardAnim }] }}
              >
                <AnimatedTouchable
                  style={styles.card}
                  onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}
                  onLongPress={() => handleDeleteCard(item)}
                  delayLongPress={350}
                >
                  {item.image ? (
                    <Image source={item.image} style={styles.cardImg} />
                  ) : (
                    <View style={styles.cardNoImageBox}>
                      <Text style={styles.cardNoImageText}>暫無圖片</Text>
                    </View>
                  )}
                  <Text style={styles.cardText}>{item.title}</Text>
                  <Text style={styles.cardDateText}>{item.date}</Text>
                </AnimatedTouchable>
              </Animated.View>
            );
          })}
        </ScrollView>

      </ScrollView>

      {/* 底部導航 */}
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

          {/* 中間留空位給凸出來的按鈕 */}
          <View style={{ width: 80 }} />

          {/* 右側兩個按鈕 */}
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/diary')}>
            <Image source={getIcon('gallery', colors.mode)} style={styles.icon} />
            <Text style={styles.navText}>日誌本</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/member')}>
            <Image source={getIcon('profile', colors.mode)} style={styles.icon} />
            <Text style={styles.navText}>我的</Text>
          </TouchableOpacity>
        </View>

        {/* 真正的中間大按鈕：使用絕對定位 */}
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
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    marginRight: 12,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    resizeMode: 'contain',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.inputText,
    padding: 0,
  },
  creatorContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    height: 110,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '92%',
  },
  addCreator: {
    width: 60,
    height: 60,
    backgroundColor: colors.surface,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.text,
  },
  creatorCard: {
    alignItems: 'center',
    marginRight: 10,
  },
  creatorImg: {
    width: 60,
    height: 60,
    backgroundColor: colors.placeholder,
    borderRadius: 10,
    marginBottom: 5,
  },
  creatorText: {
    fontSize: 12,
    color: colors.text,
  },
  todayCard: {
    backgroundColor: colors.mid,
    margin: 15,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    minHeight: 150,
  },
  todayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subText: {
    fontSize: 12,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.text,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.mode === 'dark' ? '#000000' : 'white',
    fontSize: 15,
    textAlign: 'center',
  },
  imagePlaceholder: {
    width: 118,
    height: 200,
    borderRadius: 10,
    resizeMode: 'contain',
    position: 'absolute',
    right: 18,
    top: -25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 20,
    marginTop: 14,
  },
  emptySearchText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 30,
  },
  sectionHint: {
    fontSize: 12,
    color: colors.hint,
    marginLeft: 20,
    marginTop: 2,
  },
  card: {
    width: 128,
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginVertical: 14,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  cardImg: {
    width: 96,
    height: 96,
    backgroundColor: colors.placeholder,
    marginBottom: 8,
    borderRadius: 10,
  },
  cardNoImageBox: {
    width: 96,
    height: 96,
    backgroundColor: colors.placeholder,
    marginBottom: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNoImageText: {
    fontSize: 12,
    color: colors.subtleText,
    fontWeight: '600',
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  cardDateText: {
    fontSize: 12,
    color: colors.dateText,
    marginTop: 2,
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
    top: -25, // 向上位移，數值約為按鈕直徑的一半
    backgroundColor: colors.fab,
    width: 50,
    height: 50,
    borderRadius: 25, // 寬度的一半才能變圓
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    width: 30,
    height: 30,
  },
});