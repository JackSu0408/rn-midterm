import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../store/recipeStore';
import { useThemeColors } from '../store/themeStore';
import { getIcon } from '../utils/icons';

const SETTINGS_ITEMS = [
    { key: 'newRecipe', title: '新食譜推薦', hint: '收到符合喜好的新食譜時通知我' },
    { key: 'diaryReminder', title: '日誌提醒', hint: '提醒我紀錄今天的烘焙成果' },
    { key: 'marketing', title: '行銷與活動訊息', hint: '接收促銷活動與最新消息' },
];

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const styles = createStyles(colors);
    const notificationSettings = useRecipeStore((state) => state.notificationSettings);
    const updateNotificationSettings = useRecipeStore((state) => state.updateNotificationSettings);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/member'))}>
                    <Image source={getIcon('back', colors.mode)} style={styles.headerBackIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>通知設定</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.settingList}>
                    {SETTINGS_ITEMS.map((item, index) => (
                        <View
                            key={item.key}
                            style={[styles.settingItem, index !== SETTINGS_ITEMS.length - 1 && styles.settingItemDivider]}
                        >
                            <View style={styles.settingTextWrap}>
                                <Text style={styles.settingTitle}>{item.title}</Text>
                                <Text style={styles.settingHint}>{item.hint}</Text>
                            </View>
                            <Switch
                                value={!!notificationSettings[item.key]}
                                onValueChange={(value) => updateNotificationSettings({ [item.key]: value })}
                                trackColor={{ false: colors.border, true: colors.dark }}
                                thumbColor={colors.surface}
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    headerBackIcon: { width: 28, height: 28 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.subtleText, marginLeft: 8 },
    content: { paddingHorizontal: 20, paddingTop: 10 },
    settingList: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    settingItemDivider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceSoft,
    },
    settingTextWrap: { flex: 1, marginRight: 12 },
    settingTitle: { fontSize: 15, fontWeight: '600', color: colors.subtleText, marginBottom: 4 },
    settingHint: { fontSize: 12, color: colors.muted },
});
