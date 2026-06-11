import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipeStore } from '../store/recipeStore';
import { useThemeColors } from '../store/themeStore';
import { getIcon } from '../utils/icons';

export default function DraftsScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const styles = createStyles(colors);
    const drafts = useRecipeStore((state) => state.drafts);
    const removeDraft = useRecipeStore((state) => state.removeDraft);

    const handleDeleteDraft = (draft) => {
        Alert.alert('刪除草稿', `確定要刪除「${draft.recordName || '未命名草稿'}」嗎？`, [
            { text: '取消', style: 'cancel' },
            { text: '刪除', style: 'destructive', onPress: () => removeDraft(draft.id) },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/member'))}>
                    <Image source={getIcon('back', colors.mode)} style={styles.headerBackIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>草稿箱</Text>
            </View>

            {drafts.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>還沒有草稿</Text>
                    <Text style={styles.emptyHint}>在記錄頁按下「草稿箱」即可儲存未完成的紀錄</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
                    {drafts.map((draft) => (
                        <TouchableOpacity
                            key={draft.id}
                            style={styles.draftCard}
                            activeOpacity={0.85}
                            onPress={() => router.push({ pathname: '/record', params: { draftId: draft.id } })}
                        >
                            <View style={styles.draftInfo}>
                                <Text style={styles.draftTitle} numberOfLines={1}>
                                    {draft.recordName || '未命名草稿'}
                                </Text>
                                <Text style={styles.draftDate}>最後編輯於 {draft.updatedAt}</Text>
                            </View>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteDraft(draft)}>
                                <Image source={getIcon('delete', colors.mode)} style={styles.deleteIcon} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    headerBackIcon: { width: 28, height: 28 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.subtleText, marginLeft: 8 },
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    draftCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    draftInfo: { flex: 1, marginRight: 12 },
    draftTitle: { fontSize: 16, fontWeight: '600', color: colors.subtleText, marginBottom: 4 },
    draftDate: { fontSize: 12, color: colors.muted },
    deleteButton: { padding: 4 },
    deleteIcon: { width: 20, height: 20 },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingBottom: 80,
    },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: colors.subtleText, marginBottom: 8 },
    emptyHint: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
