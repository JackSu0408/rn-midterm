import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useRecipeStore } from '../store/recipeStore';
import { useThemeColors, useThemeStore } from '../store/themeStore';
import { getIcon } from '../utils/icons';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { persistImageSource } from '../utils/imageStorage';

const MENU_ITEMS = [
  { key: 'drafts', title: '草稿箱', iconName: 'draft', route: '/drafts' },
  { key: 'timer', title: '烘焙定時器', iconName: 'alarm', route: '/timer' },
  { key: 'notification', title: '通知設定', iconName: 'notification', route: '/notificationSettings' },
  { key: 'about', title: '關於我們／意見回饋', iconName: 'menu', route: '/about' },
];

export default function MemberScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const themeMode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const recipes = useRecipeStore((state) => state.recipes);
  const favorites = useRecipeStore((state) => state.favorites);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const avatar = useProfileStore((state) => state.avatar);
  const setAvatar = useProfileStore((state) => state.setAvatar);

  const bakingCount = useMemo(
    () => Object.values(recipes).filter((recipe) => recipe.userName === 'Me' && recipe.category != null).length,
    [recipes]
  );
  const diaryCount = useMemo(
    () => Object.values(recipes).filter((recipe) => recipe.userName === 'Me' && recipe.category == null).length,
    [recipes]
  );
  const favoriteCount = favorites.length;

  const themeIconRotate = useRef(new Animated.Value(0)).current;
  const themeOverlayOpacity = useRef(new Animated.Value(0)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    Animated.timing(themeIconRotate, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => themeIconRotate.setValue(0));

    Animated.sequence([
      Animated.timing(themeOverlayOpacity, { toValue: 0.5, duration: 120, useNativeDriver: true }),
      Animated.timing(themeOverlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [themeMode]);

  const themeIconSpin = themeIconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleMenuPress = (item) => {
    if (item.route) {
      router.push(item.route);
      return;
    }
    Alert.alert(item.title, '此功能尚未開放。');
  };

  const handleAccountPress = () => {
    if (user) {
      Alert.alert('登出', '確定要登出嗎？', [
        { text: '取消', style: 'cancel' },
        { text: '登出', style: 'destructive', onPress: () => logout() },
      ]);
      return;
    }
    router.push('/login');
  };

  const handlePickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('需要相簿權限', '請允許存取相簿後再更換頭像。');
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
    setAvatar(source);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <Image source={getIcon('back', colors.mode)} style={styles.headerBackIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的</Text>
        <TouchableOpacity style={styles.authButton} onPress={handleAccountPress}>
          <Text style={styles.authButtonText}>{user ? '登出' : '登入'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 用戶資訊區 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            <Image source={user && avatar ? avatar : require('../img/Meeeee.png')} style={styles.avatar} />
            {user && (
              <TouchableOpacity style={styles.avatarEditButton} onPress={handlePickAvatar}>
                <Image source={getIcon('edit', 'dark')} style={styles.avatarEditIcon} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.profileName}>{user?.displayName || user?.email || '訪客'}</Text>
          <View style={styles.profileTag}>
            <Text style={styles.profileTagText}>烘焙愛好者</Text>
          </View>
        </View>

        {/* 數據儀表板 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bakingCount}</Text>
            <Text style={styles.statLabel}>烘焙次數</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>收藏食譜數</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{diaryCount}</Text>
            <Text style={styles.statLabel}>日誌本數</Text>
          </View>
        </View>

        {/* 外觀設定 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>外觀設定</Text>
          <View style={styles.menuList}>
            <View style={styles.menuItem}>
              <Animated.Image
                source={getIcon('switch', colors.mode)}
                style={[styles.menuIcon, { transform: [{ rotate: themeIconSpin }] }]}
              />
              <Text style={styles.menuText}>深色模式</Text>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.dark }}
                thumbColor={colors.surface}
              />
            </View>
          </View>
        </View>

        {/* 功能選單 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>其他功能</Text>
          <View style={styles.menuList}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.menuItem, index !== MENU_ITEMS.length - 1 && styles.menuItemDivider]}
                onPress={() => handleMenuPress(item)}
              >
                <Image source={getIcon(item.iconName, colors.mode)} style={styles.menuIcon} />
                <Text style={styles.menuText}>{item.title}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
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

      {/* 深色模式切換時的淡入淡出過場效果 */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.themeTransitionOverlay,
          { backgroundColor: themeMode === 'dark' ? '#000000' : '#FFFFFF', opacity: themeOverlayOpacity },
        ]}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  authButton: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  authButtonText: { fontSize: 13, color: colors.subtleText, fontWeight: '600' },
  headerBackIcon: { width: 28, height: 28 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.subtleText, marginLeft: 8 },

  // 用戶資訊區
  profileSection: { alignItems: 'center', paddingVertical: 10, marginBottom: 10 },
  avatarWrap: {
    width: 88,
    height: 88,
    marginBottom: 10,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.dark,
  },
  avatarEditButton: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.fab,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.light,
  },
  avatarEditIcon: { width: 14, height: 14, resizeMode: 'contain' },
  profileName: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 6 },
  profileTag: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  profileTagText: { fontSize: 12, color: colors.subtleText },

  // 數據儀表板
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 10,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: colors.muted },
  statValue: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.muted },

  // 功能選單
  sectionContainer: { paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, color: colors.subtleText, marginBottom: 15 },
  menuList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSoft,
  },
  menuIcon: { width: 22, height: 22, marginRight: 12 },
  menuText: { flex: 1, fontSize: 15, color: colors.subtleText },
  menuArrow: { fontSize: 20, color: colors.gray },

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
  navItem: { alignItems: 'center', flex: 1 },
  navText: { color: 'white', fontSize: 12, marginTop: 4 },
  icon: { width: 24, height: 24 },
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
  themeTransitionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
