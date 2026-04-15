import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const colors = {
  light: '#FFE1AF',
  mid: '#E2B59A',
  dark: '#B77466',
  text: '#693F27',
  black: '#212121',
};

export default function DevelopingPage({ title }) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header (包含返回鍵) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => router.back()}>
          <Image source={require('./img/back.png')} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>{title || "頁面"}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. 中間內容區 (圓圈線條 + Emoji) */}
      <View style={styles.content}>
        <View style={styles.circleFrame}>
          <Text style={styles.emoji}>🍰</Text>
          <Text style={styles.mainText}>{title}頁面</Text>
          <Text style={styles.subText}>頁面未出爐...</Text>
        </View>
      </View>

      {/* 3. 底部導航 (完全複製你成功的那個樣式) */}
      <View style={styles.navContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}>
            <Image source={require('./img/home.png')} style={styles.navIcon} />
            <Text style={styles.navText}>首頁</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/favorite')}>
            <Image source={require('./img/favorite.png')} style={styles.navIcon} />
            <Text style={styles.navText}>收藏</Text>
          </TouchableOpacity>
          <View style={{ width: 80 }} />
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/diary')}>
            <Image source={require('./img/gallery.png')} style={styles.navIcon} />
            <Text style={styles.navText}>日誌本</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/member')}>
            <Image source={require('./img/member.png')} style={styles.navIcon} />
            <Text style={styles.navText}>我的</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.plusButton} onPress={() => router.push('/record')}>
          <Image source={require('./img/add.png')} style={styles.plusIcon} />
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
    padding: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { width: 28, height: 28 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginLeft: 8 },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -100, // 讓內容往上一點，視覺比較平衡
  },
  circleFrame: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: colors.text,
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 20,
  },
  emoji: { fontSize: 40, marginBottom: 10 },
  mainText: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  subText: { fontSize: 16, color: colors.dark, marginTop: 5 },
  hintText: { fontSize: 14, color: colors.text, opacity: 0.6 },

  // 底部導航樣式 (完全與成功頁面同步)
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
    elevation: 5,
  },
  plusIcon: { width: 30, height: 30 }
});