import React from 'react';
import { Alert, StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../store/recipeStore';

const colors = {
  light: '#FFE1AF',
  mid: '#E2B59A',
  dark: '#B77466',
  text: '#693F27',
};
export default function Index() {
  const router = useRouter();
  const recipes = useRecipeStore((state) => state.recipes);
  const recentOrder = useRecipeStore((state) => state.recentOrder);
  const rankingOrder = useRecipeStore((state) => state.rankingOrder);
  const removeRecipe = useRecipeStore((state) => state.removeRecipe);

  const handleDeleteCard = (item) => {
    Alert.alert('刪除卡片', `確定要刪除「${item.title}」嗎？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '確定',
        style: 'destructive',
        onPress: () => removeRecipe(item.id),
      },
    ]);
  };

  const handleCardLongPress = (item) => {
    Alert.alert('卡片操作', `要對「${item.title}」做什麼？`, [
      {
        text: '編輯',
        onPress: () =>
          router.push({
            pathname: '/record',
            params: { editId: item.id },
          }),
      },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => handleDeleteCard(item),
      },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const recentDesserts = recentOrder
    .map((id) => recipes[id])
    .filter(Boolean)
    .slice(0, 10);

  const rankingDesserts = rankingOrder
    .map((id) => recipes[id])
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>食焙's</Text>
        <Image source={require('../img/notification.png')} style={styles.icon} />
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

        {/* 近期出爐 */}
        <Text style={styles.sectionTitle}>近期出爐</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentDesserts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}
              onLongPress={() => handleCardLongPress(item)}
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
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 排行榜 */}
        <Text style={styles.sectionTitle}>排行榜推薦</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {rankingDesserts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}
              onLongPress={() => handleCardLongPress(item)}
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
            </TouchableOpacity>
          ))}
        </ScrollView>

      </ScrollView>

      {/* 底部導航 */}
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

          {/* 中間留空位給凸出來的按鈕 */}
          <View style={{ width: 80 }} />

          {/* 右側兩個按鈕 */}
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/diary')}>
            <Image source={require('../img/gallery.png')} style={styles.icon} />
            <Text style={styles.navText}>日誌本</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/member')}>
            <Image source={require('../img/member.png')} style={styles.icon} />
            <Text style={styles.navText}>我的</Text>
          </TouchableOpacity>
        </View>

        {/* 真正的中間大按鈕：使用絕對定位 */}
        <TouchableOpacity style={styles.plusButton} onPress={() => router.push('/record')}>
          <Text style={styles.plusButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  creatorContainer: {
    backgroundColor: '#ffffff',
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
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#693F27',
  },
  creatorCard: {
    alignItems: 'center',
    marginRight: 10,
  },
  creatorImg: {
    width: 60,
    height: 60,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginBottom: 5,
  },
  creatorText: {
    fontSize: 12,
    color: '#693F27',
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
    color: 'white',
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
  card: {
    width: 128,
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginVertical: 14,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  cardImg: {
    width: 96,
    height: 96,
    backgroundColor: '#ddd',
    marginBottom: 8,
    borderRadius: 10,
  },
  cardNoImageBox: {
    width: 96,
    height: 96,
    backgroundColor: '#D9D9D9',
    marginBottom: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNoImageText: {
    fontSize: 12,
    color: '#5D4037',
    fontWeight: '600',
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  cardDateText: {
    fontSize: 12,
    color: '#999',
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
    backgroundColor: '#1A1A1A', // 你的設計圖是深色/黑色的
    width: 50,
    height: 50,
    borderRadius: 25, // 寬度的一半才能變圓
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonText: {
    color: 'white',
    fontSize: 37,
    lineHeight: 45,
    textAlign: 'center',
  },
});