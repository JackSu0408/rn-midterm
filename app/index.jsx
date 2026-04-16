import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

const colors = {
  light: '#FFE1AF',
  mid: '#E2B59A',
  dark: '#B77466',
  text: '#693F27',
};
const RECENT_DESSERTS = [
  { id: '1', name: '布朗尼', date: '2026.04.09', img: require('../img/brownie.png') },
  { id: '2', name: '戚風蛋糕', date: '2026.04.03', img: require('../img/chiffon.png') },
  { id: '3', name: '聖諾多黑', date: '2026.04.01', img: require('../img/puff.png') },
];

const RANKING_DESSERTS = [
  { id: 'r1', name: '磅蛋糕', date: '2026.03.29', img: require('../img/poundcake.png') },
  { id: 'r2', name: '蘋果奶酥', date: '2026.03.29', img: require('../img/crumble.png') },
  { id: 'r3', name: '軟餅乾', date: '2026.03.28', img: require('../img/cookies.png') },
];

export default function Index() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const recentNameParam = Array.isArray(params.recentName) ? params.recentName[0] : params.recentName;
  const recentDateParam = Array.isArray(params.recentDate) ? params.recentDate[0] : params.recentDate;
  const recentImageUriParam = Array.isArray(params.recentImageUri) ? params.recentImageUri[0] : params.recentImageUri;

  const recentDesserts = useMemo(() => {
    const cloned = [...RECENT_DESSERTS];
    if (!recentNameParam && !recentDateParam && !recentImageUriParam) {
      return cloned;
    }

    cloned[0] = {
      ...cloned[0],
      name: recentNameParam || cloned[0].name,
      date: recentDateParam || cloned[0].date,
      img: recentImageUriParam ? { uri: recentImageUriParam } : cloned[0].img,
    };
    return cloned;
  }, [recentDateParam, recentImageUriParam, recentNameParam]);

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

          <View style={styles.imagePlaceholder} />
        </View>

        {/* 近期出爐 */}
        <Text style={styles.sectionTitle}>近期出爐</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentDesserts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}
            >
              <Image source={item.img} style={styles.cardImg} />
              <Text style={styles.cardText}>{item.name}</Text>
              <Text style={[styles.cardText, { fontSize: 10, color: '#999' }]}>{item.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 排行榜 */}
        <Text style={styles.sectionTitle}>排行榜推薦</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {RANKING_DESSERTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/detail', params: { id: item.id } })}
            >
              <Image source={item.img} style={styles.cardImg} />
              <Text style={styles.cardText}>{item.name}</Text>
              <Text style={[styles.cardText, { fontSize: 10, color: '#999' }]}>{item.date}</Text>
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
    fontSize: 20,
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
    width: 80,
    height: 80,
    backgroundColor: '#ccc',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 20,
    marginTop: 10,
  },
  card: {
    width: 100,
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  cardImg: {
    width: 70,
    height: 70,
    backgroundColor: '#ddd',
    marginBottom: 5,
    borderRadius: 8,
  },
  cardText: {
    fontSize: 12,
    color: colors.text,
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