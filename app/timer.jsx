import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Text, TouchableOpacity, Image, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAudioPlayer } from 'expo-audio';
import { useThemeColors } from '../store/themeStore';
import { getIcon } from '../utils/icons';
import AnimatedTouchable from '../components/AnimatedTouchable';

const ADD_PRESETS = [1, 5, 10];
const MAX_SECONDS = 180 * 60;

const SOUND_OPTIONS = [
    { key: 'bell', label: '清脆', source: require('../assets/sounds/beep.wav'), interval: 400, repeatCount: 3 },
    { key: 'classic', label: '經典', source: require('../assets/sounds/beep-classic.wav'), interval: 400, repeatCount: 3 },
    { key: 'danger', label: '警示', source: require('../assets/sounds/danger.wav'), interval: 6000, repeatCount: 1 },
];

const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function TimerScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const styles = createStyles(colors);
    const [baseSeconds, setBaseSeconds] = useState(10 * 60);
    const [remainingSeconds, setRemainingSeconds] = useState(10 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editMinutes, setEditMinutes] = useState('10');
    const [editSeconds, setEditSeconds] = useState('0');
    const [soundIndex, setSoundIndex] = useState(0);
    const [isSoundPickerOpen, setIsSoundPickerOpen] = useState(false);
    const intervalRef = useRef(null);
    const beepIntervalRef = useRef(null);
    const isReleasedRef = useRef(false);
    const flashAnim = useRef(new Animated.Value(1)).current;

    const startTimeFlash = () => {
        flashAnim.setValue(1);
        Animated.loop(
            Animated.sequence([
                Animated.timing(flashAnim, { toValue: 0.2, duration: 300, useNativeDriver: true }),
                Animated.timing(flashAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
            { iterations: 5 }
        ).start();
    };
    const beepPlayers = [
        useAudioPlayer(SOUND_OPTIONS[0].source),
        useAudioPlayer(SOUND_OPTIONS[1].source),
        useAudioPlayer(SOUND_OPTIONS[2].source),
    ];
    const beepPlayer = beepPlayers[soundIndex];

    const startBeepLoop = () => {
        let beepCount = 0;

        const soundOption = SOUND_OPTIONS[soundIndex];
        const playInterval = soundOption?.interval ?? 700;
        const repeatCount = soundOption?.repeatCount ?? 3;

        const playOnce = () => {
            if (isReleasedRef.current) {
                return;
            }

            let playDuration = playInterval;
            try {
                beepPlayer.seekTo(0);
                beepPlayer.play();
                if (beepPlayer.duration > 0) {
                    playDuration = beepPlayer.duration * 1000;
                }
            } catch (error) {
                // player 可能已被釋放，忽略
            }
            beepCount += 1;

            // 同一組內：等聲音播完再播下一次；播完一組（repeatCount 次）後固定停頓 2 秒再重新開始
            const delay = beepCount % repeatCount === 0 ? 2000 : playDuration;
            beepIntervalRef.current = setTimeout(playOnce, delay);
        };

        playOnce();
    };

    const stopBeepLoop = () => {
        if (beepIntervalRef.current) {
            clearTimeout(beepIntervalRef.current);
            beepIntervalRef.current = null;
        }
        if (isReleasedRef.current) {
            return;
        }
        try {
            beepPlayer.pause();
        } catch (error) {
            // player 可能已被釋放，忽略
        }
    };

    useEffect(() => {
        if (!isRunning) {
            return;
        }

        intervalRef.current = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    setIsRunning(false);
                    startBeepLoop();
                    startTimeFlash();
                    Alert.alert('時間到！', '烘焙計時結束囉，記得確認成品狀態。', [
                        {
                            text: '確定',
                            onPress: () => stopBeepLoop(),
                        },
                    ]);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    useEffect(() => {
        isReleasedRef.current = false;
        return () => {
            stopBeepLoop();
            isReleasedRef.current = true;
        };
    }, []);

    const addMinutes = (minutes) => {
        const addedSeconds = minutes * 60;
        setRemainingSeconds((prev) => Math.min(MAX_SECONDS, prev + addedSeconds));
        setBaseSeconds((prev) => Math.min(MAX_SECONDS, prev + addedSeconds));
    };

    const handleStartPause = () => {
        if (remainingSeconds <= 0) {
            return;
        }
        setIsRunning((prev) => !prev);
        setHasStarted(true);
    };

    const handleResetButtonPress = () => {
        flashAnim.stopAnimation();
        flashAnim.setValue(1);
        if (hasStarted) {
            // 計時開始後：重設回設定的時間
            setIsRunning(false);
            setRemainingSeconds(baseSeconds);
            setHasStarted(false);
        } else {
            // 計時開始前：歸零
            setIsRunning(false);
            setRemainingSeconds(0);
        }
    };

    const openEditModal = () => {
        setEditMinutes(String(Math.floor(remainingSeconds / 60)));
        setEditSeconds(String(remainingSeconds % 60));
        setIsEditing(true);
    };

    const confirmEdit = () => {
        const minutes = Math.max(0, Math.min(180, Number.parseInt(editMinutes, 10) || 0));
        const seconds = Math.max(0, Math.min(59, Number.parseInt(editSeconds, 10) || 0));
        const totalSeconds = Math.min(MAX_SECONDS, minutes * 60 + seconds);
        setRemainingSeconds(totalSeconds);
        setBaseSeconds(totalSeconds);
        setIsRunning(false);
        setHasStarted(false);
        setIsEditing(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/member'))}>
                    <Image source={getIcon('back', colors.mode)} style={styles.headerBackIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>烘焙定時器</Text>
                <TouchableOpacity style={styles.soundButton} onPress={() => setIsSoundPickerOpen(true)}>
                    <Image source={getIcon('move', colors.mode)} style={styles.soundIcon} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <TouchableOpacity activeOpacity={0.7} onPress={openEditModal} style={styles.timeDisplayWrap}>
                    <Animated.Text style={[styles.timeDisplay, { opacity: flashAnim }]}>
                        {formatTime(remainingSeconds)}
                    </Animated.Text>
                    <Image source={getIcon('edit', colors.mode)} style={styles.editIcon} />
                </TouchableOpacity>

                <View style={styles.presetRow}>
                    {ADD_PRESETS.map((minutes) => (
                        <AnimatedTouchable key={minutes} style={styles.presetButton} onPress={() => addMinutes(minutes)}>
                            <Text style={styles.presetText}>+{minutes} 分鐘</Text>
                        </AnimatedTouchable>
                    ))}
                </View>

                <View style={styles.controlRow}>
                    <AnimatedTouchable style={styles.resetButton} onPress={handleResetButtonPress}>
                        <Text style={styles.resetButtonText}>{hasStarted ? '重設' : '歸零'}</Text>
                    </AnimatedTouchable>
                    <AnimatedTouchable style={styles.startButton} onPress={handleStartPause}>
                        <Text style={styles.startButtonText}>{isRunning ? '暫停' : '開始'}</Text>
                    </AnimatedTouchable>
                </View>
            </View>

            <Modal visible={isEditing} transparent animationType="fade" onRequestClose={() => setIsEditing(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>設定時間</Text>
                        <View style={styles.modalInputRow}>
                            <View style={styles.modalInputGroup}>
                                <TextInput
                                    style={styles.modalInput}
                                    keyboardType="number-pad"
                                    value={editMinutes}
                                    onChangeText={setEditMinutes}
                                    maxLength={3}
                                    autoFocus
                                />
                                <Text style={styles.modalInputLabel}>分</Text>
                            </View>
                            <View style={styles.modalInputGroup}>
                                <TextInput
                                    style={styles.modalInput}
                                    keyboardType="number-pad"
                                    value={editSeconds}
                                    onChangeText={setEditSeconds}
                                    maxLength={2}
                                />
                                <Text style={styles.modalInputLabel}>秒</Text>
                            </View>
                        </View>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setIsEditing(false)}>
                                <Text style={styles.modalCancelText}>取消</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmEdit}>
                                <Text style={styles.modalConfirmText}>確定</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isSoundPickerOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsSoundPickerOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>選擇提示音</Text>
                        {SOUND_OPTIONS.map((option, index) => {
                            const isSelected = soundIndex === index;
                            return (
                                <TouchableOpacity
                                    key={option.key}
                                    style={[styles.soundOption, isSelected && styles.soundOptionSelected]}
                                    onPress={() => {
                                        try {
                                            beepPlayers[index].seekTo(0);
                                            beepPlayers[index].play();
                                        } catch (error) {
                                            // ignore preview playback errors
                                        }
                                        setSoundIndex(index);
                                    }}
                                >
                                    <Text style={[styles.soundOptionText, isSelected && styles.soundOptionTextSelected]}>
                                        {option.label}
                                    </Text>
                                    {isSelected && <Text style={styles.soundCheckMark}>✓</Text>}
                                </TouchableOpacity>
                            );
                        })}
                        <TouchableOpacity style={styles.soundConfirmButton} onPress={() => setIsSoundPickerOpen(false)}>
                            <Text style={styles.modalConfirmText}>完成</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    headerBackIcon: { width: 28, height: 28 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.subtleText, marginLeft: 8, flex: 1 },
    soundButton: { padding: 4 },
    soundIcon: { width: 26, height: 26, resizeMode: 'contain' },
    content: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 30 },
    timeDisplayWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    timeDisplay: { fontSize: 64, fontWeight: 'bold', color: colors.text, marginRight: 10 },
    editIcon: { width: 22, height: 22 },
    presetRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 30 },
    presetButton: {
        borderWidth: 1,
        borderColor: colors.dark,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        margin: 6,
    },
    presetText: { color: colors.text, fontSize: 14, fontWeight: '600' },
    controlRow: { flexDirection: 'row', width: '100%' },
    resetButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.text,
        borderRadius: 30,
        paddingVertical: 15,
        alignItems: 'center',
        marginRight: 12,
    },
    resetButtonText: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    startButton: {
        flex: 1,
        backgroundColor: colors.text,
        borderRadius: 30,
        paddingVertical: 15,
        alignItems: 'center',
    },
    startButtonText: { color: colors.mode === 'dark' ? '#000000' : '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

    // 編輯時間 Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '80%',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: { fontSize: 16, fontWeight: '600', color: colors.subtleText, marginBottom: 14 },
    modalInputRow: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 16,
    },
    modalInputGroup: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 6,
    },
    modalInput: {
        width: '100%',
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 20,
        color: colors.inputText,
        marginBottom: 6,
    },
    modalInputLabel: { fontSize: 13, color: colors.muted },
    modalButtonRow: { flexDirection: 'row', width: '100%' },
    modalCancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.text,
        borderRadius: 30,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 10,
    },
    modalCancelText: { color: colors.text, fontSize: 15, fontWeight: 'bold' },
    modalConfirmButton: {
        flex: 1,
        backgroundColor: colors.text,
        borderRadius: 30,
        paddingVertical: 12,
        alignItems: 'center',
    },
    modalConfirmText: { color: colors.surface, fontSize: 15, fontWeight: 'bold' },

    // 提示音選擇
    soundOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.surfaceSoft,
    },
    soundOptionSelected: {
        borderColor: colors.text,
        backgroundColor: colors.surfaceSoft,
    },
    soundOptionText: { fontSize: 16, color: colors.subtleText },
    soundOptionTextSelected: { color: colors.text, fontWeight: 'bold' },
    soundCheckMark: { fontSize: 18, color: colors.text, fontWeight: 'bold' },
    soundConfirmButton: {
        width: '100%',
        backgroundColor: colors.text,
        borderRadius: 30,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 6,
    },
});
