import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useRecipeStore } from '../store/recipeStore';

const FormItem = ({ iconSource, label, placeholder, value, onChangeText, multiline = false }) => {
    const lineHeight = 18;
    const inputVerticalPadding = 16;
    const maxLines = 3;
    const minInputHeight = lineHeight + inputVerticalPadding;
    const maxInputHeight = lineHeight * maxLines + inputVerticalPadding;
    const [inputHeight, setInputHeight] = useState(minInputHeight);

    const getHeightByText = (text) => {
        const lineCount = Math.max(1, String(text || '').split('\n').length);
        const clampedLineCount = Math.min(maxLines, lineCount);
        return lineHeight * clampedLineCount + inputVerticalPadding;
    };

    useEffect(() => {
        if (!multiline) {
            setInputHeight(minInputHeight);
            return;
        }
        setInputHeight(getHeightByText(value));
    }, [multiline, value, minInputHeight]);

    const handleTextChange = (text) => {
        if (multiline) {
            setInputHeight(getHeightByText(text));
        }
        onChangeText(text);
    };

    const handleContentSizeChange = (event) => {
        if (!multiline) {
            return;
        }
        const contentHeight = event.nativeEvent.contentSize.height;
        const nextHeight = Math.max(minInputHeight, Math.min(maxInputHeight, contentHeight));
        setInputHeight((prev) => Math.max(prev, nextHeight));
    };

    return (
        <View style={[styles.formItem, multiline && styles.formItemMultiline]}>
            <View style={[styles.labelContainer, multiline && styles.labelContainerMultiline]}>
                <Image source={iconSource} style={styles.formIcon} />
                <Text style={styles.labelText}>{label} |</Text>
            </View>
            <TextInput
                style={[styles.input, multiline && styles.inputMultiline, multiline && { height: inputHeight }]}
                placeholder={placeholder}
                placeholderTextColor="#A0A0A0"
                value={value}
                onChangeText={handleTextChange}
                multiline={multiline}
                blurOnSubmit={!multiline}
                submitBehavior={multiline ? 'newline' : 'blurAndSubmit'}
                returnKeyType={multiline ? 'default' : 'done'}
                textAlignVertical={multiline ? 'top' : 'center'}
                scrollEnabled={multiline && inputHeight >= maxInputHeight}
                onContentSizeChange={handleContentSizeChange}
            />
        </View>
    );
};

const CATEGORY_OPTIONS = ['蛋糕', '麵包', '餅乾', '泡芙', '法式', '英式', '日式', '美式'];

const colors = {
  light: '#FFE1AF',
  mid: '#E2B59A',
  dark: '#B77466',
  text: '#693F27',
    black: '#212121',
};

export default function BakingRecordScreen() {
    const router = useRouter();
    const { editId } = useLocalSearchParams();
    const normalizedEditId = Array.isArray(editId) ? editId[0] : editId;
    const addRecipe = useRecipeStore((state) => state.addRecipe);
    const updateRecipe = useRecipeStore((state) => state.updateRecipe);
    const editingRecipe = useRecipeStore((state) =>
        normalizedEditId ? state.recipes[String(normalizedEditId)] : null
    );
    const [recordName, setRecordName] = useState('');
    const [ingredientText, setIngredientText] = useState('');
    const [methodText, setMethodText] = useState('');
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

        setRecordName(editingRecipe.title || '');
        setIngredientText(
            Array.isArray(editingRecipe.ingredients)
                ? editingRecipe.ingredients
                      .map((item) => [item.name, item.amount].filter(Boolean).join(' ').trim())
                      .filter(Boolean)
                      .join('\n')
                : ''
        );
        setMethodText(Array.isArray(editingRecipe.steps) ? editingRecipe.steps.join('\n') : '');
        setHeatTimeText(nextHeatTime);
        setNoteText(pureNoteLines.join('\n'));
        setCategory(nextCategory);
        setPermission(nextPermission);
        setSatisfaction(Number.parseInt(String(editingRecipe.satisfaction || '0'), 10) || 0);
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

        // Guard again to keep the list capped at 20 even if picker returns more assets.
        const picked = result.assets.map((asset, index) => ({
            id: `${asset.uri}-${Date.now()}-${index}`,
            uri: asset.uri,
            source: { uri: asset.uri },
        }));
        setImages((prev) => [...prev, ...picked].slice(0, maxImages));
    };

    const removeImage = (indexToRemove) => {
        setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
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

        const ingredients = ingredientText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => ({ name: line, amount: '' }));

        const steps = methodText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

        const normalizedImages = images
            .map((item) => item.source || (item.uri ? { uri: item.uri } : null))
            .filter(Boolean);

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
            ingredients: ingredients.length ? ingredients : [{ name: '未填寫食材', amount: '' }],
            steps: steps.length ? steps : ['未填寫作法'],
            category,
            permission,
        };

        if (normalizedEditId) {
            updateRecipe(normalizedEditId, payload);
        } else {
            addRecipe(payload);
        }

        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                                <TouchableOpacity onPress={() => router.replace('/')}>
                                        <Image source={require('../img/back.png')} style={styles.headerBackIcon} />
                                </TouchableOpacity>
                <Text style={styles.headerTitle}>{normalizedEditId ? '編輯烘焙紀錄' : '烘焙紀錄'}</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* 名稱輸入欄位 */}
                <View style={styles.nameContainer}>
                    <Text style={styles.namePrefix}>|</Text>
                    <TextInput
                        style={styles.nameInput}
                        placeholder="名稱"
                        placeholderTextColor="#A0A0A0"
                        value={recordName}
                        onChangeText={setRecordName}
                    />
                </View>

                {/* 各種表單項目 */}
                <FormItem
                    iconSource={require('../img/shopping_cart_24dp_693F27_FILL0_wght400_GRAD0_opsz24.png')}
                    label="食材"
                    placeholder="請輸入食材"
                    value={ingredientText}
                    onChangeText={setIngredientText}
                    multiline
                />
                <FormItem
                    iconSource={require('../img/method.png')}
                    label="作法"
                    placeholder="請輸入作法"
                    value={methodText}
                    onChangeText={setMethodText}
                    multiline
                />
                <FormItem
                    iconSource={require('../img/heat.png')}
                    label="烤溫及時間"
                    placeholder="請輸入烤溫及時間"
                    value={heatTimeText}
                    onChangeText={setHeatTimeText}
                    multiline
                />
                <View style={styles.formItemRating}>
                    <View style={styles.labelContainerRating}>
                        <Image source={require('../img/star.png')} style={styles.formIcon} />
                        <Text style={styles.labelText}>滿意度 |</Text>
                    </View>
                    <View style={styles.starsRow}>
                        {Array.from({ length: 10 }, (_, index) => {
                            const starValue = index + 1;
                            const isFilled = starValue <= satisfaction;
                            return (
                                <TouchableOpacity
                                    key={starValue}
                                    onPress={() => setSatisfaction(starValue)}
                                    style={styles.starButton}
                                >
                                    <Text style={[styles.starText, isFilled ? styles.starFilled : styles.starEmpty]}>
                                        {isFilled ? '★' : '☆'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
                <View style={[styles.formItemStack, showCategoryOptions && styles.formItemStackCategoryActive]}>
                    <View style={[styles.formItem, styles.formItemInStack]}>
                        <View style={styles.labelContainer}>
                            <Image source={require('../img/label.png')} style={styles.formIcon} />
                            <Text style={styles.labelText}>分類 |</Text>
                        </View>
                        <View style={styles.dropdownWrap}>
                            <TouchableOpacity
                                style={styles.dropdownTrigger}
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

                <FormItem
                    iconSource={require('../img/note.png')}
                    label="備註"
                    placeholder="請輸入備註"
                    value={noteText}
                    onChangeText={setNoteText}
                    multiline
                />

                <View style={[styles.formItemStack, showPermissionOptions && styles.formItemStackActive]}>
                    <View style={[styles.formItem, styles.formItemInStack]}>
                        <View style={styles.labelContainer}>
                            <Image source={require('../img/lock.png')} style={styles.formIcon} />
                            <Text style={styles.labelText}>權限 |</Text>
                        </View>
                        <View style={styles.dropdownWrap}>
                            <TouchableOpacity
                                style={styles.dropdownTrigger}
                                onPress={() => setShowPermissionOptions((prev) => !prev)}
                            >
                                <Text style={styles.dropdownText}>{permission}</Text>
                                <Text style={styles.dropdownArrow}>{showPermissionOptions ? '▲' : '▼'}</Text>
                            </TouchableOpacity>

                            {showPermissionOptions && (
                                <View style={styles.dropdownOptions}>
                                    {['公開', '好友可見', '私人'].map((option) => (
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
                </View>

                <View style={styles.formItemStack}>
                    <View style={[styles.formItem, styles.formItemInStack]}>
                        <View style={styles.labelContainer}>
                            <Image source={require('../img/addphoto.png')} style={styles.formIcon} />
                            <Text style={styles.labelText}>新增圖片 |</Text>
                        </View>
                        <TouchableOpacity style={styles.imageAddButton} onPress={pickImages}>
                            <Text style={styles.imageAddButtonText}>選擇圖片 ({images.length}/{maxImages})</Text>
                        </TouchableOpacity>
                    </View>

                    {images.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.imagePreviewScroll}
                            contentContainerStyle={styles.imagePreviewContainer}
                        >
                            {images.map((item, index) => (
                                <View key={`${item.id || item.uri || 'image'}-${index}`} style={styles.imageCard}>
                                    <Image source={item.source} style={styles.previewImage} />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => removeImage(index)}
                                    >
                                        <Text style={styles.removeImageText}>x</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* 儲存按鈕 */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>✓ 儲存</Text>
                </TouchableOpacity>
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
    container: { flex: 1, backgroundColor: colors.light, },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    headerBackIcon: { width: 28, height: 28 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#5D4037', marginLeft: 8 },
    content: { paddingHorizontal: 20 },
    contentContainer: { paddingBottom: 110 },
    nameContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    namePrefix: { fontSize: 28, color: '#5D4037', marginRight: 8 },
    nameInput: { fontSize: 24, fontWeight: 'bold', flex: 1 },
    formItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    formItemMultiline: { alignItems: 'flex-start' },
    formItemInStack: { marginBottom: 0 },
    formItemRating: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    formItemStack: { marginBottom: 16 },
    formItemStackActive: { zIndex: 30 },
    formItemStackCategoryActive: { zIndex: 60 },
    labelContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
    labelContainerMultiline: { marginTop: 8 },
    labelContainerRating: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
    formIcon: { width: 24, height: 24 },
    labelText: { fontSize: 18, color: '#5D4037', marginLeft: 6, fontWeight: '600' },
    input: {
        flex: 1,
        height: 34,
        borderWidth: 1,
        borderColor: '#D7CCC8',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#FFF7EB',
    },
    inputMultiline: {
        minHeight: 34,
        maxHeight: 70,
        lineHeight: 18,
        paddingTop: 8,
        paddingBottom: 8,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
    },
    starButton: {
        flex: 1,
        alignItems: 'center',
    },
    starText: {
        fontSize: 20,
    },
    starFilled: {
        color: '#F5A623',
    },
    starEmpty: {
        color: '#B0A9A5',
    },
    dropdownTrigger: {
        minWidth: 90,
        maxWidth: 110,
        height: 34,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#D7CCC8',
        borderRadius: 10,
        backgroundColor: '#FFF7EB',
    },
    dropdownWrap: {
        position: 'relative',
        alignSelf: 'flex-start',
        zIndex: 40,
    },
    dropdownText: {
        fontSize: 14,
        color: '#5D4037',
    },
    dropdownArrow: {
        fontSize: 10,
        color: '#5D4037',
    },
    dropdownOptions: {
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#D7CCC8',
        borderRadius: 8,
        backgroundColor: '#FFF7EB',
        overflow: 'hidden',
        width: 110,
        zIndex: 50,
        elevation: 3,
    },
    dropdownOptionsCategory: {
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#D7CCC8',
        borderRadius: 8,
        backgroundColor: '#FFF7EB',
        overflow: 'hidden',
        width: 120,
        zIndex: 70,
        elevation: 5,
    },
    dropdownOption: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    dropdownOptionText: {
        color: '#5D4037',
        fontSize: 16,
    },
    imageAddButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D7CCC8',
        borderRadius: 10,
        minHeight: 40,
        justifyContent: 'center',
        paddingHorizontal: 12,
        backgroundColor: '#FFF7EB',
    },
    imageAddButtonText: {
        color: '#5D4037',
        fontSize: 15,
    },
    imagePreviewScroll: {
        marginLeft: 140,
        marginTop: 4,
    },
    imagePreviewContainer: {
        paddingTop: 8,
        paddingBottom: 4,
        paddingRight: 8,
    },
    imageCard: {
        position: 'relative',
        marginRight: 10,
    },
    previewImage: {
        width: 78,
        height: 78,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D7CCC8',
    },
    removeImageButton: {
        position: 'absolute',
        right: 4,
        top: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#212121',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#FFFFFF',
        fontSize: 12,
        lineHeight: 14,
    },
    saveButton: {
        backgroundColor: colors.text,
        borderRadius: 30,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 40,
        marginHorizontal: 40
    },
    saveButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
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
        backgroundColor: colors.black,
        width: 50,
        height: 50,
        borderRadius: 25,
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