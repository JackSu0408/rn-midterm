import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../store/themeStore';
import { getIcon } from '../utils/icons';

export default function AboutScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const styles = createStyles(colors);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = () => {
        if (!feedback.trim()) {
            Alert.alert('請輸入內容', '請先填寫您的意見再送出。');
            return;
        }
        Alert.alert('感謝您的回饋！', '我們已收到您的意見，會持續改善食焙\'s App。');
        setFeedback('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/member'))}>
                    <Image source={getIcon('back', colors.mode)} style={styles.headerBackIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>關於我們／意見回饋</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.appName}>食焙's</Text>
                    <Text style={styles.version}>版本 1.0.0</Text>
                    <Text style={styles.description}>
                        食焙's 是一款專為烘焙愛好者設計的食譜紀錄 App，幫助你記錄每一次的烘焙成果、整理食譜與心得日誌，並與大家分享美味的甜點。
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>意見回饋</Text>
                    <Text style={styles.sectionHint}>有任何建議或問題嗎？歡迎告訴我們！</Text>
                    <TextInput
                        style={styles.feedbackInput}
                        placeholder="請輸入您的意見..."
                        placeholderTextColor={colors.gray}
                        value={feedback}
                        onChangeText={setFeedback}
                        multiline
                        textAlignVertical="top"
                    />
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>送出</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    headerBackIcon: { width: 28, height: 28 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.subtleText, marginLeft: 8 },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    appName: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    version: { fontSize: 12, color: colors.muted, marginBottom: 12 },
    description: { fontSize: 14, color: colors.subtleText, lineHeight: 22 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.subtleText, marginBottom: 6 },
    sectionHint: { fontSize: 13, color: colors.muted, marginBottom: 12 },
    feedbackInput: {
        height: 120,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: colors.inputText,
        backgroundColor: colors.surfaceAlt,
        marginBottom: 12,
    },
    submitButton: {
        backgroundColor: colors.text,
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
    },
    submitButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
});
