import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useRecipeStore } from '../store/recipeStore';
import { persistImageSource } from '../utils/imageStorage';
import { useThemeColors } from '../store/themeStore';
import { getIcon } from '../utils/icons';
import AnimatedTouchable from '../components/AnimatedTouchable';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 分類資料
const categories = [
  { name: '蛋糕', iconName: 'cake' },
  { name: '麵包', iconName: 'bread' },
  { name: '餅乾', iconName: 'cookie' },
  { name: '其他', iconName: 'icecream' },
];

const STATUS_OPTIONS = ['公開', '私人'];

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export default function BakingLogScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const recipes = useRecipeStore((state) => state.recipes);
  const recentOrder = useRecipeStore((state) => state.recentOrder);
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const updateRecipe = useRecipeStore((state) => state.updateRecipe);
  const removeRecipe = useRecipeStore((state) => state.removeRecipe);
  const [openStatusId, setOpenStatusId] = useState(null);
  const [editingTitleId, setEditingTitleId] = useState(null);

  const diaryList = useMemo(
    () =>
      recentOrder
        .map((id) => recipes[id])
        .filter((recipe) => recipe && recipe.userName === 'Me' && recipe.category == null),
    [recentOrder, recipes]
  );

  const handleSelectStatus = (id, status) => {
    const recipe = recipes[id];
    if (!recipe) {
      return;
    }

    const noteLines = String(recipe.note || '')
      .split('\n')
      .filter((line) => !line.trim().startsWith('權限：'));
    noteLines.push(`權限：${status}`);

    updateRecipe(id, { permission: status, note: noteLines.join('\n') });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenStatusId(null);
  };

  const handleToggleStatusDropdown = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenStatusId((prev) => (prev === id ? null : id));
  };

  const handleSelectCategory = (categoryName) => {
    router.push({ pathname: '/category', params: { category: categoryName } });
  };

  const handleCreateDiary = () => {
    addRecipe({
      title: '',
      image: null,
      images: [],
      userName: 'Me',
      userAvatar: require('../img/Meeeee.png'),
      satisfaction: '0★',
      note: '未填寫備註\n權限：公開',
      date: formatDate(new Date()),
      ingredients: [{ name: '未填寫食材', amount: '' }],
      steps: ['未填寫作法'],
      category: null,
      permission: '公開',
      recipeIds: [],
    });
  };

  const handleTitleChange = (id, text) => {
    updateRecipe(id, { title: text });
  };

  const handleDeleteDiary = (id, title) => {
    Alert.alert('刪除日誌本', `確定要刪除「${title || '未命名日誌本'}」嗎？此操作無法復原。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => removeRecipe(id),
      },
    ]);
  };

  const handlePickCover = async (id) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('需要相簿權限', '請允許存取相簿後再新增封面。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const source = persistImageSource({ uri: result.assets[0].uri });
    updateRecipe(id, { image: source, images: [source] });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <Image source={getIcon('back', colors.mode)} style={styles.headerBackIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>烘焙日誌本</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 分類區域 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>分類</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryItem}
                activeOpacity={0.8}
                onPress={() => handleSelectCategory(cat.name)}
              >
                <View style={styles.iconBox}>
                  <Image source={cat.icon || getIcon(cat.iconName, colors.mode)} style={styles.categoryIcon} />
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 我的日誌區域 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>我的日誌本</Text>
          
          {diaryList.length === 0 && (
            <Text style={styles.emptyText}>還沒有日誌，建立你的第一筆烘焙紀錄吧！</Text>
          )}

          {diaryList.map((item) => {
            const status = item.permission || '公開';
            return (
              <View
                key={item.id}
                style={[styles.diaryCard, openStatusId === item.id && styles.diaryCardActive]}
              >
                <TouchableOpacity activeOpacity={0.8} onPress={() => handlePickCover(item.id)}>
                  {item.image ? (
                    <Image source={item.image} style={styles.diaryImage} />
                  ) : (
                    <Image source={require('../img/bookAdd.png')} style={styles.diaryImage} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.diaryInfo}
                  activeOpacity={0.88}
                  onPress={() =>
                    router.push({
                      pathname: '/diaryLog',
                      params: { diaryId: item.id, title: item.title },
                    })
                  }
                >
                  <View style={styles.diaryTitleRow}>
                    {editingTitleId === item.id || !item.title ? (
                      <TextInput
                        style={[styles.diaryTitleInput, styles.diaryTitleInputFlex]}
                        value={item.title}
                        onChangeText={(text) => handleTitleChange(item.id, text)}
                        onBlur={() => setEditingTitleId(null)}
                        onSubmitEditing={() => setEditingTitleId(null)}
                        placeholder="請輸入日誌本名稱"
                        placeholderTextColor={colors.gray}
                        autoFocus={editingTitleId === item.id}
                      />
                    ) : (
                      <>
                        <Text style={styles.diaryTitle}>{item.title}</Text>
                        <TouchableOpacity onPress={() => setEditingTitleId(item.id)}>
                          <Image source={getIcon('edit', colors.mode)} style={styles.diaryTitleEditIcon} />
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity
                      style={styles.deleteDiaryButton}
                      onPress={() => handleDeleteDiary(item.id, item.title)}
                    >
                      <Image source={getIcon('delete', colors.mode)} style={styles.deleteDiaryIcon} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.statusWrap}>
                    <TouchableOpacity
                      style={styles.statusBadge}
                      onPress={() => handleToggleStatusDropdown(item.id)}
                    >
                      <Text style={styles.statusText}>{status}</Text>
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
                </TouchableOpacity>
              </View>
            );
          })}

          {/* 繼續建立按鈕 */}
          <View style={styles.diaryCard}>
            <Image source={require('../img/book.png')} style={styles.diaryImage} />
            <View style={styles.diaryInfo}>
              <AnimatedTouchable style={styles.createNewButton} onPress={handleCreateDiary}>
                <Image source={getIcon('add', colors.mode)} style={styles.createNewIcon} />
                <Text style={styles.createNewText}>繼續建立</Text>
              </AnimatedTouchable>
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
  container: { flex: 1, backgroundColor: colors.light },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  headerBackIcon: { width: 28, height: 28 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.subtleText, marginLeft: 8 },
  sectionContainer: { paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, color: colors.subtleText, marginBottom: 15 },

  // Grid 樣式
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryItem: { width: '23%', marginBottom: 15, alignItems: 'center' },
  iconBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4, // 稍微圓角
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryIcon: { width: 28, height: 28, marginBottom: 4 },
  categoryName: { fontSize: 12, color: colors.muted, marginTop: 4 },

  emptyText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 20,
  },

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
  diaryTitleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.inputText,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 2,
  },
  diaryTitleInputFlex: { flex: 1, marginRight: 8 },
  diaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  diaryTitle: { fontSize: 20, fontWeight: 'bold', color: colors.subtleText, flexShrink: 1 },
  diaryTitleEditIcon: {
    width: 16,
    height: 16,
    marginLeft: 8,
    resizeMode: 'contain',
  },
  deleteDiaryButton: {
    marginLeft: 'auto',
    paddingLeft: 8,
  },
  deleteDiaryIcon: { width: 18, height: 18, resizeMode: 'contain' },
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
    backgroundColor: colors.surfaceAlt,
  },
  statusText: { color: colors.muted, marginRight: 4 },
  statusArrow: { color: colors.muted, fontSize: 12 },
  statusDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
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
    color: colors.subtleText,
    fontSize: 13,
  },
  updateDate: { fontSize: 10, color: colors.muted },

  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignSelf: 'flex-start'
  },
  createNewIcon: { width: 18, height: 18 },
  createNewText: { color: colors.muted, marginLeft: 5 },

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
  plusIcon: { width: 30, height: 30 },
});