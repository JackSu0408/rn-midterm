import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../store/themeStore';
import { useRecipeStore } from '../store/recipeStore';
import { getIcon } from '../utils/icons';
import { generateRecipeWithGroq } from '../utils/groq';

const CATEGORY_OPTIONS = ['蛋糕', '麵包', '餅乾', '其他'];

const QUESTIONS = [
    {
        key: 'type',
        title: '想做哪種甜點呢？',
        placeholder: '例如：巧克力蛋糕、抹茶餅乾...',
        multiline: false,
        required: true,
    },
    {
        key: 'ingredients',
        title: '手邊有哪些主要食材？',
        placeholder: '例如：雞蛋、麵粉、奶油、砂糖...',
        multiline: true,
        required: true,
    },
    {
        key: 'time',
        title: '大概想花多少時間製作？',
        placeholder: '例如：30 分鐘內、1 小時左右...',
        multiline: false,
        required: true,
    },
    {
        key: 'notes',
        title: '有什麼特殊需求嗎？（選填）',
        placeholder: '例如：不要核果、口味偏酸甜、想要酥脆口感...',
        multiline: true,
        required: false,
    },
];

export default function AiRecipeScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const styles = createStyles(colors);
    const saveDraft = useRecipeStore((state) => state.saveDraft);

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({ type: '', ingredients: '', time: '', notes: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);

    const currentQuestion = QUESTIONS[step];
    const isLastStep = step === QUESTIONS.length - 1;
    const canProceed = !currentQuestion.required || answers[currentQuestion.key].trim().length > 0;

    const handleChangeAnswer = (text) => {
        setAnswers((prev) => ({ ...prev, [currentQuestion.key]: text }));
    };

    const handleNext = () => {
        if (!canProceed) {
            Alert.alert('請填寫內容', '這個問題需要填寫後才能繼續。');
            return;
        }
        if (isLastStep) {
            handleGenerate();
            return;
        }
        setStep((prev) => prev + 1);
    };

    const handleBack = () => {
        if (step === 0) {
            router.canGoBack() ? router.back() : router.replace('/member');
            return;
        }
        setStep((prev) => prev - 1);
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const recipe = await generateRecipeWithGroq(answers);
            setResult(recipe);
        } catch (error) {
            Alert.alert('生成失敗', error.message || '請稍後再試一次。');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestart = () => {
        setResult(null);
        setStep(0);
        setAnswers({ type: '', ingredients: '', time: '', notes: '' });
    };

    const handleSaveDraft = () => {
        if (!result) {
            return;
        }
        const draftId = `ai-draft-${Date.now()}`;
        const ingredients = Array.isArray(result.ingredients) && result.ingredients.length
            ? result.ingredients.filter(Boolean)
            : [''];
        const steps = Array.isArray(result.steps) && result.steps.length
            ? result.steps.filter(Boolean)
            : ['', '', ''];

        saveDraft(draftId, {
            recordName: result.title || '',
            ingredients,
            steps,
            stepImages: steps.map(() => null),
            heatTimeText: result.heatTimeText || '',
            noteText: result.note || '',
            category: CATEGORY_OPTIONS.includes(result.category) ? result.category : '其他',
            permission: '私人',
            satisfaction: 0,
            images: [],
        });

        router.push(`/record?draftId=${draftId}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack}>
                    <Image source={getIcon('back', colors.mode)} style={styles.headerBackIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI 食譜生成（測試版）</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color={colors.text} />
                        <Text style={styles.loadingText}>AI 生成中，請稍候...</Text>
                    </View>
                ) : result ? (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>{result.title || '未命名食譜'}</Text>
                        <View style={styles.categoryTag}>
                            <Text style={styles.categoryTagText}>{result.category || '其他'}</Text>
                        </View>

                        {!!result.heatTimeText && (
                            <Text style={styles.resultMeta}>烤溫及時間：{result.heatTimeText}</Text>
                        )}

                        <Text style={styles.sectionTitle}>食材</Text>
                        {(result.ingredients || []).map((item, index) => (
                            <Text key={`ingredient-${index}`} style={styles.listItem}>• {item}</Text>
                        ))}

                        <Text style={styles.sectionTitle}>步驟</Text>
                        {(result.steps || []).map((item, index) => (
                            <Text key={`step-${index}`} style={styles.listItem}>{index + 1}. {item}</Text>
                        ))}

                        {!!result.note && (
                            <>
                                <Text style={styles.sectionTitle}>小提示</Text>
                                <Text style={styles.listItem}>{result.note}</Text>
                            </>
                        )}

                        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveDraft}>
                            <Text style={styles.primaryButtonText}>儲存為草稿並編輯</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleRestart}>
                            <Text style={styles.secondaryButtonText}>重新填寫問題</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.questionCard}>
                        <Text style={styles.stepIndicator}>問題 {step + 1} / {QUESTIONS.length}</Text>
                        <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
                        <TextInput
                            style={[styles.input, currentQuestion.multiline && styles.inputMultiline]}
                            placeholder={currentQuestion.placeholder}
                            placeholderTextColor={colors.gray}
                            value={answers[currentQuestion.key]}
                            onChangeText={handleChangeAnswer}
                            multiline={currentQuestion.multiline}
                            textAlignVertical={currentQuestion.multiline ? 'top' : 'center'}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                <Text style={styles.backButtonText}>{step === 0 ? '返回' : '上一步'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                                <Text style={styles.nextButtonText}>{isLastStep ? '生成食譜' : '下一步'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    headerBackIcon: { width: 28, height: 28 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.subtleText, marginLeft: 8 },
    content: { paddingHorizontal: 20, paddingBottom: 40, flexGrow: 1 },

    questionCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        marginTop: 10,
    },
    stepIndicator: { fontSize: 13, color: colors.muted, marginBottom: 8 },
    questionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
    input: {
        width: '100%',
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.inputText,
        backgroundColor: colors.surfaceAlt,
    },
    inputMultiline: { minHeight: 100 },
    buttonRow: { flexDirection: 'row', marginTop: 20 },
    backButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.text,
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        marginRight: 10,
    },
    backButtonText: { color: colors.text, fontSize: 15, fontWeight: 'bold' },
    nextButton: {
        flex: 1,
        backgroundColor: colors.text,
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
    },
    nextButtonText: { color: colors.surface, fontSize: 15, fontWeight: 'bold' },

    loadingWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    loadingText: { marginTop: 16, fontSize: 14, color: colors.muted },

    resultCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        marginTop: 10,
    },
    resultTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    categoryTag: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 3,
        marginBottom: 10,
    },
    categoryTagText: { fontSize: 12, color: colors.subtleText },
    resultMeta: { fontSize: 14, color: colors.subtleText, marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginTop: 14, marginBottom: 6 },
    listItem: { fontSize: 14, color: colors.subtleText, lineHeight: 22 },

    primaryButton: {
        backgroundColor: colors.text,
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 24,
    },
    primaryButtonText: { color: colors.surface, fontSize: 15, fontWeight: 'bold' },
    secondaryButton: {
        borderWidth: 1,
        borderColor: colors.text,
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    secondaryButtonText: { color: colors.text, fontSize: 15, fontWeight: 'bold' },
});
