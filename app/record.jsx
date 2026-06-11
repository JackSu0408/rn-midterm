import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useRecipeStore } from '../store/recipeStore';
import { persistImageSource } from '../utils/imageStorage';
import { useThemeColors } from '../store/themeStore';
import { getIcon } from '../utils/icons';

const CATEGORY_OPTIONS = ['蛋糕', '麵包', '餅乾', '其他'];
const MAX_SATISFACTION = 5;

export default function BakingRecordScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const styles = createStyles(colors);
    const { editId, draftId } = useLocalSearchParams();
    const normalizedEditId = Array.isArray(editId) ? editId[0] : editId;
    const normalizedDraftId = Array.isArray(draftId) ? draftId[0] : draftId;
    const addRecipe = useRecipeStore((state) => state.addRecipe);
    const updateRecipe = useRecipeStore((state) => state.updateRecipe);
    const saveDraft = useRecipeStore((state) => state.saveDraft);
    const removeDraft = useRecipeStore((state) => state.removeDraft);
    const editingRecipe = useRecipeStore((state) =>
        normalizedEditId ? state.recipes[String(normalizedEditId)] : null
    );
    const editingDraft = useRecipeStore((state) =>
        normalizedDraftId ? state.getDraftById(normalizedDraftId) : null
    );
    const [recordName, setRecordName] = useState('');
    const [ingredients, setIngredients] = useState(['']);
    const [steps, setSteps] = useState(['', '', '']);
    const [stepImages, setStepImages] = useState([null, null, null]);
    const [heatTimeText, setHeatTimeText] = useState('');
    const [noteText, setNoteText] = useState('');
    const [category, setCategory] = useState('蛋糕');
    const [showCategoryOptions, setShowCategoryOptions] = useState(false);
    const [satisfaction, setSatisfaction] = useState(0);
    const [permission, setPermission] = useState('公開');
    const [showPermissionOptions, setShowPermissionOptions] = useState(false);
    const [images, setImages] = useState([]);

    const maxImages = 20;
    const remainingImages = useMemo(() => maxImages - images.length, [images.length]);
    const coverImage = images[0]?.source;

    useEffect(() => {
        if (!normalizedEditId || !editingRecipe) {
            return;
        }

        const noteLines = String(editingRecipe.note || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

        let nextHeatTime = '';
        let nextCategory = editingRecipe.category || '蛋糕';
        let nextPermission = editingRecipe.permission || '公開';
        const pureNoteLines = [];

        noteLines.forEach((line) => {
            if (line.startsWith('烤溫及時間：')) {
                nextHeatTime = line.replace('烤溫及時間：', '').trim();
                return;
            }
            if (line.startsWith('分類：')) {
                nextCategory = line.replace('分類：', '').trim() || nextCategory;
                return;
            }
            if (line.startsWith('權限：')) {
                nextPermission = line.replace('權限：', '').trim() || nextPermission;
                return;
            }
            pureNoteLines.push(line);
        });

        const imageSources = Array.isArray(editingRecipe.images) && editingRecipe.images.length > 0
            ? editingRecipe.images
            : (editingRecipe.image ? [editingRecipe.image] : []);

        const nextIngredients = Array.isArray(editingRecipe.ingredients)
            ? editingRecipe.ingredients
                  .map((item) => [item.name, item.amount].filter(Boolean).join(' ').trim())
                  .filter(Boolean)
            : [];

        const nextSteps = Array.isArray(editingRecipe.steps)
            ? editingRecipe.steps.filter(Boolean)
            : [];

        const fallbackSteps = nextSteps.length ? nextSteps : ['', '', ''];
        const savedStepImages = Array.isArray(editingRecipe.stepImages) ? editingRecipe.stepImages : [];

        setRecordName(editingRecipe.title || '');
        setIngredients(nextIngredients.length ? nextIngredients : ['']);
        setSteps(fallbackSteps);
        setStepImages(fallbackSteps.map((_, index) => savedStepImages[index] || null));
        setHeatTimeText(nextHeatTime);
        setNoteText(pureNoteLines.join('\n'));
        setCategory(nextCategory);
        setPermission(nextPermission);
        setSatisfaction(
            Math.min(MAX_SATISFACTION, Number.parseInt(String(editingRecipe.satisfaction || '0'), 10) || 0)
        );
        setImages(
            imageSources
                .map((source, index) => {
                    if (!source) {
                        return null;
                    }
                    if (typeof source === 'number') {
                        return { id: `local-${index}`, source };
                    }
                    if (source?.uri) {
                        return { id: source.uri, uri: source.uri, source: { uri: source.uri } };
                    }
                    return { id: `remote-${index}`, source };
                })
                .filter(Boolean)
        );
    }, [normalizedEditId, editingRecipe]);

    useEffect(() => {
        if (!normalizedDraftId || !editingDraft) {
            return;
        }

        setRecordName(editingDraft.recordName || '');
        setIngredients(editingDraft.ingredients?.length ? editingDraft.ingredients : ['']);
        setSteps(editingDraft.steps?.length ? editingDraft.steps : ['', '', '']);
        setStepImages(
            editingDraft.steps?.length
                ? editingDraft.steps.map((_, index) => editingDraft.stepImages?.[index] || null)
                : [null, null, null]
        );
        setHeatTimeText(editingDraft.heatTimeText || '');
        setNoteText(editingDraft.noteText || '');
        setCategory(editingDraft.category || '蛋糕');
        setPermission(editingDraft.permission || '公開');
        setSatisfaction(editingDraft.satisfaction || 0);
        setImages(editingDraft.images || []);
    }, [normalizedDraftId, editingDraft]);

    const pickImages = async () => {
        if (remainingImages <= 0) {
            Alert.alert('已達上限', `最多只能新增 ${maxImages} 張圖片。`);
            return;
        }

        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.status !== 'granted') {
            Alert.alert('需要相簿權限', '請允許存取相簿後再新增圖片。');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: remainingImages,
            quality: 1,
        });

        if (result.canceled || !result.assets?.length) {
            return;
        }

        const picked = result.assets.map((asset, index) => ({
            id: `${asset.uri}-${Date.now()}-${index}`,
            uri: asset.uri,
            source: { uri: asset.uri },
        }));
        setImages((prev) => [...prev, ...picked].slice(0, maxImages));
    };

    const pickStepImage = async (index) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.status !== 'granted') {
            Alert.alert('需要相簿權限', '請允許存取相簿後再新增圖片。');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 1,
        });

        if (result.canceled || !result.assets?.length) {
            return;
        }

        const uri = result.assets[0].uri;
        setStepImages((prev) => prev.map((item, i) => (i === index ? { uri } : item)));
    };

    const updateIngredient = (index, text) => {
        setIngredients((prev) => prev.map((item, i) => (i === index ? text : item)));
    };

    const addIngredient = () => {
        setIngredients((prev) => [...prev, '']);
    };

    const removeIngredient = (index) => {
        setIngredients((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
    };

    const updateStep = (index, text) => {
        setSteps((prev) => prev.map((item, i) => (i === index ? text : item)));
    };

    const addStep = () => {
        setSteps((prev) => [...prev, '']);
        setStepImages((prev) => [...prev, null]);
    };

    const removeStep = (index) => {
        if (steps.length <= 1) {
            return;
        }
        setSteps((prev) => prev.filter((_, i) => i !== index));
        setStepImages((prev) => prev.filter((_, i) => i !== index));
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    const handleSave = () => {
        const trimmedName = recordName.trim();
        if (!trimmedName) {
            Alert.alert('請輸入名稱', '儲存前請先填寫名稱。');
            return;
        }

        const normalizedIngredients = ingredients
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => ({ name: line, amount: '' }));

        const normalizedSteps = [];
        const normalizedStepImages = [];
        steps.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) {
                return;
            }
            normalizedSteps.push(trimmed);
            normalizedStepImages.push(stepImages[index] ? persistImageSource(stepImages[index]) : null);
        });

        const normalizedImages = images
            .map((item) => item.source || (item.uri ? { uri: item.uri } : null))
            .filter(Boolean)
            .map(persistImageSource);

        const mergedNote = [
            noteText.trim(),
            heatTimeText.trim() ? `烤溫及時間：${heatTimeText.trim()}` : '',
            `分類：${category}`,
            `權限：${permission}`,
        ]
            .filter(Boolean)
            .join('\n');

        const payload = {
            title: trimmedName,
            image: normalizedImages[0] || null,
            images: normalizedImages,
            userName: 'Me',
            userAvatar: require('../img/Meeeee.png'),
            satisfaction: `${satisfaction}★`,
            note: mergedNote || '未填寫備註',
            date: formatDate(new Date()),
            ingredients: normalizedIngredients.length ? normalizedIngredients : [{ name: '未填寫食材', amount: '' }],
            steps: normalizedSteps.length ? normalizedSteps : ['未填寫作法'],
            stepImages: normalizedSteps.length ? normalizedStepImages : [null],
            category,
            permission,
        };

        if (normalizedEditId) {
            updateRecipe(normalizedEditId, payload);
        } else {
            addRecipe(payload);
        }

        if (normalizedDraftId) {
            removeDraft(normalizedDraftId);
        }

        router.replace('/');
    };

    const handleSaveDraft = () => {
        const persistedImages = images.map((item) => {
            const source = item.source || (item.uri ? { uri: item.uri } : null);
            const persisted = persistImageSource(source);
            return persisted?.uri ? { id: item.id, uri: persisted.uri, source: persisted } : item;
        });
        const persistedStepImages = stepImages.map((item) => (item ? persistImageSource(item) : null));

        const draftPayload = {
            recordName,
            ingredients,
            steps,
            stepImages: persistedStepImages,
            heatTimeText,
            noteText,
            category,
            permission,
            satisfaction,
            images: persistedImages,
            updatedAt: formatDate(new Date()),
        };

        saveDraft(normalizedDraftId, draftPayload);
        Alert.alert('已儲存草稿', '可以到「我的」頁面的草稿箱繼續編輯。', [
            { text: '確定', onPress: () => router.replace('/') },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
                    <Image source={getIcon('back', colors.mode)} style={styles.headerBackIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {normalizedEditId ? '編輯烘焙紀錄' : normalizedDraftId ? '編輯草稿' : '烘焙紀錄'}
                </Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* 封面圖片 */}
                <View style={styles.coverImageBox}>
                    {coverImage ? (
                        <Image source={coverImage} style={styles.coverImage} />
                    ) : (
                        /* 這裡移除了原本內部交叉的 X 畫線 View */
                        <View style={styles.coverPlaceholder} />
                    )}
                    <TouchableOpacity style={styles.changePhotoButton} onPress={pickImages}>
                        <Image source={getIcon('addphoto', colors.mode)} style={styles.changePhotoIcon} />
                        <Text style={styles.changePhotoText}>變更照片</Text>
                    </TouchableOpacity>
                </View>

                {/* 名稱輸入欄位 */}
                <View style={styles.nameRow}>
                    <Text style={styles.nameLabel}>名稱</Text>
                    <TextInput
                        style={styles.nameInput}
                        placeholder="例如：熔岩巧克力蛋糕"
                        placeholderTextColor={colors.gray}
                        value={recordName}
                        onChangeText={setRecordName}
                    />
                </View>

                {/* 食材 */}
                <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeaderRow}>
                        <View style={styles.sectionTitleRow}>
                            <Image
                                source={getIcon('ingredients', colors.mode)}
                                style={styles.sectionIcon}
                            />
                            <Text style={styles.sectionTitleText}>食材</Text>
                        </View>
                        <TouchableOpacity onPress={addIngredient}>
                            <Text style={styles.addLink}>+新增食材</Text>
                        </TouchableOpacity>
                    </View>

                    {ingredients.map((value, index) => (
                        <View key={`ingredient-${index}`} style={styles.listRow}>
                            <Text style={styles.dragHandle}>☰</Text>
                            <TextInput
                                style={styles.listInput}
                                placeholder="請輸入食材"
                                placeholderTextColor={colors.gray}
                                value={value}
                                onChangeText={(text) => updateIngredient(index, text)}
                            />
                            {ingredients.length > 1 && (
                                <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.rowDeleteButton}>
                                    <Image source={getIcon('delete', colors.mode)} style={styles.rowDeleteIcon} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

                {/* 作法 */}
                <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeaderRow}>
                        <View style={styles.sectionTitleRow}>
                            <Image source={getIcon('method', colors.mode)} style={styles.sectionIcon} />
                            <Text style={styles.sectionTitleText}>作法</Text>
                        </View>
                        <TouchableOpacity onPress={addStep}>
                            <Text style={styles.addLink}>+新增步驟</Text>
                        </TouchableOpacity>
                    </View>

                    {styles && steps.map((value, index) => (
                        <View key={`step-${index}`} style={styles.listRow}>
                            <View style={styles.stepNumberCircle}>
                                <Text style={styles.stepNumberText}>{index + 1}</Text>
                            </View>
                            <TextInput
                                style={styles.listInput}
                                placeholder="請輸入作法"
                                placeholderTextColor={colors.gray}
                                value={value}
                                onChangeText={(text) => updateStep(index, text)}
                            />
                            <TouchableOpacity style={styles.stepImageButton} onPress={() => pickStepImage(index)}>
                                {stepImages[index] ? (
                                    <Image source={stepImages[index]} style={styles.stepImageThumb} />
                                ) : (
                                    <Image source={getIcon('addphoto', colors.mode)} style={styles.stepImageIcon} />
                                )}
                            </TouchableOpacity>
                            {steps.length > 1 && (
                                <TouchableOpacity onPress={() => removeStep(index)} style={styles.rowDeleteButton}>
                                    <Image source={getIcon('delete', colors.mode)} style={styles.rowDeleteIcon} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

                {/* 烤溫及時間 / 滿意度 / 標籤 */}
                <View style={[styles.tripleRow, showCategoryOptions && styles.tripleRowActive]}>
                    <View style={styles.tripleCol}>
                        <View style={styles.tripleLabelRow}>
                            <Image source={getIcon('heat', colors.mode)} style={styles.smallIcon} />
                            <Text style={styles.tripleLabelText}>烤溫及時間</Text>
                        </View>
                        <TextInput
                            style={styles.tripleInput}
                            placeholder="請輸入烤溫及時間"
                            placeholderTextColor={colors.gray}
                            value={heatTimeText}
                            onChangeText={setHeatTimeText}
                        />
                    </View>

                    <View style={styles.tripleCol}>
                        <View style={styles.tripleLabelRow}>
                            <Image source={getIcon('star', colors.mode)} style={styles.smallIcon} />
                            <Text style={styles.tripleLabelText}>滿意度</Text>
                        </View>
                        <View style={styles.starsRow}>
                            {Array.from({ length: MAX_SATISFACTION }, (_, index) => {
                                const starValue = index + 1;
                                const isFilled = starValue <= satisfaction;
                                return (
                                    <TouchableOpacity key={starValue} onPress={() => setSatisfaction(starValue)}>
                                        <Text style={[styles.starText, isFilled ? styles.starFilled : styles.starEmpty]}>
                                            {isFilled ? '★' : '☆'}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={[styles.tripleCol, styles.tripleColLast]}>
                        <View style={styles.tripleLabelRow}>
                            <Image source={getIcon('label', colors.mode)} style={styles.smallIcon} />
                            <Text style={styles.tripleLabelText}>標籤</Text>
                        </View>
                        <View style={styles.tagDropdownWrap}>
                            <TouchableOpacity
                                style={styles.tagDropdownTrigger}
                                onPress={() => setShowCategoryOptions((prev) => !prev)}
                            >
                                <Text style={styles.dropdownText}>{category}</Text>
                                <Text style={styles.dropdownArrow}>{showCategoryOptions ? '▲' : '▼'}</Text>
                            </TouchableOpacity>

                            {showCategoryOptions && (
                                <View style={styles.dropdownOptionsCategory}>
                                    {CATEGORY_OPTIONS.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={styles.dropdownOption}
                                            onPress={() => {
                                                setCategory(option);
                                                setShowCategoryOptions(false);
                                            }}
                                        >
                                            <Text style={styles.dropdownOptionText}>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* 權限 */}
                <View style={[styles.permissionRow, showPermissionOptions && styles.permissionRowActive]}>
                    <View style={[styles.tripleLabelRow, styles.permissionLabelRow]}>
                        <Image source={getIcon('lock', colors.mode)} style={styles.smallIcon} />
                        <Text style={styles.tripleLabelText}>權限</Text>
                    </View>
                    <View style={styles.permissionDropdownWrap}>
                        <TouchableOpacity
                            style={styles.permissionDropdownTrigger}
                            onPress={() => setShowPermissionOptions((prev) => !prev)}
                        >
                            <Text style={styles.dropdownText}>{permission}</Text>
                            <Text style={styles.dropdownArrow}>{showPermissionOptions ? '▲' : '▼'}</Text>
                        </TouchableOpacity>

                        {showPermissionOptions && (
                            <View style={styles.dropdownOptions}>
                                {['公開', '私人'].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.dropdownOption}
                                        onPress={() => {
                                            setPermission(option);
                                            setShowPermissionOptions(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownOptionText}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* 備註 */}
                <View style={styles.noteRow}>
                    <Image source={getIcon('edit', colors.mode)} style={styles.smallIcon} />
                    <TextInput
                        style={styles.noteInput}
                        placeholder="請輸入備註"
                        placeholderTextColor={colors.gray}
                        value={noteText}
                        onChangeText={setNoteText}
                    />
                </View>

                {/* 底部按鈕 */}
                <View style={styles.bottomButtonsRow}>
                    {!normalizedEditId && !normalizedDraftId && (
                        <TouchableOpacity style={styles.draftButton} onPress={handleSaveDraft}>
                            <Text style={styles.draftButtonText}>草稿箱</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>✓ 儲存</Text>
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
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.subtleText, marginLeft: 8 },
    content: { paddingHorizontal: 20 },
    contentContainer: { paddingBottom: 110 },

    // 封面圖片
    coverImageBox: {
        width: '100%',
        height: 180,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        backgroundColor: colors.surfaceAlt,
    },
    coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    coverPlaceholder: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    
    changePhotoButton: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(93,64,55,0.85)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    changePhotoIcon: { width: 16, height: 16, marginRight: 4, tintColor: 'white' },
    changePhotoText: { color: 'white', fontSize: 13 },

    // 名稱表單區塊優化
    nameRow: {
        flexDirection: 'column', // 改為垂直排列以釋放文字寬度
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    nameLabel: {
        fontSize: 16,
        color: colors.subtleText,
        fontWeight: '600',
        marginBottom: 6, // 改為與下方的輸入框保持間距
    },
    nameInput: {
        width: '100%',
        height: 44, // 增加明確的高度，防止 Placeholder 文字上下被遮蓋
        fontSize: 16,
        color: colors.inputText,
        borderBottomWidth: 1, // 改為底線樣式，更有輸入框的視覺感
        borderBottomColor: colors.border,
        paddingVertical: 0,
        paddingHorizontal: 4,
        textAlignVertical: 'center',
        includeFontPadding: false,
    },

    // 區塊（食材／作法）
    sectionBlock: { marginBottom: 16 },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
    sectionIcon: { width: 22, height: 22, marginRight: 6 },
    sectionTitleText: { fontSize: 18, fontWeight: '600', color: colors.subtleText },
    addLink: { fontSize: 14, color: colors.accentOrange, fontWeight: '600' },

    listRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    dragHandle: { fontSize: 16, color: colors.gray, marginRight: 8 },
    listInput: {
        flex: 1,
        height: 38,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 0,
        backgroundColor: colors.surfaceAlt,
        color: colors.inputText,
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
    stepNumberCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.dark,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    stepNumberText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    stepImageButton: {
        width: 38,
        height: 38,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surfaceAlt,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    stepImageIcon: { width: 20, height: 20 },
    stepImageThumb: { width: '100%', height: '100%' },
    rowDeleteButton: { marginLeft: 8, padding: 4 },
    rowDeleteIcon: { width: 18, height: 18 },

    // 三欄列：烤溫及時間 / 滿意度 / 標籤
    tripleRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    tripleRowActive: { zIndex: 50 },
    tripleCol: { flex: 1, marginRight: 10 },
    tripleColLast: { marginRight: 0 },
    tripleLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    smallIcon: { width: 18, height: 18, marginRight: 4 },
    tripleLabelText: { fontSize: 13, color: colors.subtleText, fontWeight: '600' },
    tripleInput: {
        height: 34,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 0,
        backgroundColor: colors.surfaceAlt,
        color: colors.inputText,
        fontSize: 11,
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 34,
    },
    starText: { fontSize: 18 },
    starFilled: { color: colors.accentOrange },
    starEmpty: { color: colors.gray },

    // 權限
    permissionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    permissionRowActive: { zIndex: 40 },
    permissionLabelRow: { marginBottom: 0 },
    permissionDropdownWrap: {
        position: 'relative',
        zIndex: 40,
        width: 120,
        marginLeft: 24,
    },
    permissionDropdownTrigger: {
        width: '100%',
        height: 34,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        backgroundColor: colors.surfaceAlt,
    },

    // 下拉選單
    tagDropdownWrap: {
        position: 'relative',
        width: '100%',
        zIndex: 40,
    },
    tagDropdownTrigger: {
        width: '100%',
        height: 34,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        backgroundColor: colors.surfaceAlt,
    },
    dropdownText: { fontSize: 14, color: colors.subtleText },
    dropdownArrow: { fontSize: 10, color: colors.subtleText },
    dropdownOptions: {
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: 4,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surfaceAlt,
        overflow: 'hidden',
        width: 120,
        zIndex: 50,
        elevation: 3,
    },
    dropdownOptionsCategory: {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 4,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surfaceAlt,
        overflow: 'hidden',
        width: 120,
        zIndex: 70,
        elevation: 5,
    },
    dropdownOption: { paddingVertical: 10, paddingHorizontal: 12 },
    dropdownOptionText: { color: colors.subtleText, fontSize: 16 },

    // 備註
    noteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        height: 38,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: colors.surfaceAlt,
    },
    noteInput: {
        flex: 1,
        height: '100%',
        marginLeft: 8,
        fontSize: 14,
        color: colors.inputText,
        paddingVertical: 0,
        textAlignVertical: 'center',
        includeFontPadding: false,
    },

    // 底部按鈕
    bottomButtonsRow: {
        flexDirection: 'row',
        marginTop: 24,
        marginHorizontal: 20,
    },
    draftButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.text,
        borderRadius: 30,
        paddingVertical: 15,
        alignItems: 'center',
        marginRight: 12,
    },
    draftButtonText: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    saveButton: {
        flex: 1,
        backgroundColor: colors.text,
        borderRadius: 30,
        paddingVertical: 15,
        alignItems: 'center',
    },
    saveButtonText: { color: colors.mode === 'dark' ? '#000000' : '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});