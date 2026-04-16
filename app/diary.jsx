import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// 分類資料
const categories = [
  { name: '蛋糕', icon: require('../img/cake.png') },
  { name: '麵包', icon: require('../img/bread.png') },
  { name: '餅乾', icon: require('../img/cookie.png') },
  { name: '泡芙', icon: require('../img/sorticon.png') },
  { name: '法式', icon: require('../img/sorticon.png') },
  { name: '英式', icon: require('../img/sorticon.png') },
  { name: '日式', icon: require('../img/sorticon.png') },
  { name: '美式', icon: require('../img/sorticon.png') },
];

// 日誌資料
const diaries = [
  { id: '1', title: '巴斯克蛋糕', status: '公開', date: '2026.04.08', image: require('../img/basque.png') },
  { id: '2', title: '紐約重乳酪', status: '私人', date: '2026.04.08', image: require('../img/cheesecake.png') },
];

const STATUS_OPTIONS = ['公開', '私人'];

export default function BakingLogScreen() {
  const router = useRouter();
  const [diaryList, setDiaryList] = useState(diaries);
  const [openStatusId, setOpenStatusId] = useState(null);

  const handleSelectStatus = (id, status) => {
    setDiaryList((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    setOpenStatusId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Image source={require('../img/back.png')} style={styles.headerBackIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>烘焙日誌本</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 分類區域 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>分類</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.iconBox}>
                  <Image source={cat.icon} style={styles.categoryIcon} />
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 我的日誌區域 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>我的日誌</Text>
          
          {diaryList.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              style={[styles.diaryCard, openStatusId === item.id && styles.diaryCardActive]}
              onPress={() =>
                router.push({
                  pathname: '/diaryLog',
                  params: { diaryId: item.id, title: item.title },
                })
              }
            >
              <Image source={item.image} style={styles.diaryImage} />
              
              <View style={styles.diaryInfo}>
                <Text style={styles.diaryTitle}>{item.title}</Text>
                <View style={styles.statusWrap}>
                  <TouchableOpacity
                    style={styles.statusBadge}
                    onPress={() => setOpenStatusId((prev) => (prev === item.id ? null : item.id))}
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                    <Text style={styles.statusArrow}>{openStatusId === item.id ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {openStatusId === item.id && (
                    <View style={styles.statusDropdown}>
                      {STATUS_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.statusOption}
                          onPress={() => handleSelectStatus(item.id, option)}
                        >
                          <Text style={styles.statusOptionText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                <Text style={styles.updateDate}>最後一次更新於 {item.date}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* 繼續建立按鈕 (最後一個項目) */}
          <View style={styles.diaryCard}>
            <Image source={require('../img/book.png')} style={styles.diaryImage} />
            <View style={styles.diaryInfo}>
              <TouchableOpacity style={styles.createNewButton}>
                <Image source={require('../img/add.png')} style={styles.createNewIcon} />
                <Text style={styles.createNewText}>繼續建立</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* 底部墊高，避免內容被 TabBar 遮住 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 底部導覽列 */}
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
  container: { flex: 1, backgroundColor: '#FFE1AF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  headerBackIcon: { width: 28, height: 28 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#5D4037', marginLeft: 8 },
  sectionContainer: { paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, color: '#5D4037', marginBottom: 15 },
  
  // Grid 樣式
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryItem: { width: '23%', marginBottom: 15, alignItems: 'center' },
  iconBox: { 
    width: '100%', 
    aspectRatio: 1, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 4, // 稍微圓角
  },
  categoryIcon: { width: 28, height: 28, marginBottom: 4 },
  categoryName: { fontSize: 12, color: '#8D6E63', marginTop: 4 },

  // 日誌卡片樣式
  diaryCard: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  diaryCardActive: { zIndex: 20 },
  diaryImage: {
    width: 100, 
    height: 140, 
    borderRadius: 4,
    resizeMode: 'cover',
  },
  
  diaryInfo: { flex: 1, marginLeft: 20 },
  diaryTitle: { fontSize: 20, fontWeight: 'bold', color: '#5D4037', marginBottom: 8 },
  statusWrap: {
    position: 'relative',
    alignSelf: 'flex-start',
    zIndex: 30,
    marginBottom: 8,
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7EB',
  },
  statusText: { color: '#8D6E63', marginRight: 4 },
  statusArrow: { color: '#8D6E63', fontSize: 12 },
  statusDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    borderWidth: 1,
    borderColor: '#D7CCC8',
    borderRadius: 8,
    backgroundColor: '#FFF7EB',
    marginTop: 4,
    width: 110,
    overflow: 'hidden',
    zIndex: 40,
    elevation: 3,
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  statusOptionText: {
    color: '#5D4037',
    fontSize: 13,
  },
  updateDate: { fontSize: 10, color: '#8D6E63' },
  
  createNewButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 8, 
    paddingHorizontal: 15, 
    paddingVertical: 8,
    alignSelf: 'flex-start'
  },
  createNewIcon: { width: 18, height: 18 },
  createNewText: { color: '#8D6E63', marginLeft: 5 },

  // Bottom Nav
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
    backgroundColor: '#B77466',
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
    backgroundColor: '#212121',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: { width: 30, height: 30 },
});