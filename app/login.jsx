import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../store/themeStore';
import { getIcon } from '../utils/icons';
import { useAuthStore, getAuthErrorMessage } from '../store/authStore';

export default function LoginScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const styles = createStyles(colors);
    const login = useAuthStore((state) => state.login);
    const register = useAuthStore((state) => state.register);

    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !password) {
            Alert.alert('請輸入完整資訊', '請輸入電子郵件與密碼。');
            return;
        }
        if (isRegisterMode && !name.trim()) {
            Alert.alert('請輸入暱稱', '請輸入您的暱稱。');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isRegisterMode) {
                await register(email.trim(), password, name.trim());
            } else {
                await login(email.trim(), password);
            }
            router.back();
        } catch (error) {
            console.error('Auth error:', error);
            Alert.alert(isRegisterMode ? '註冊失敗' : '登入失敗', getAuthErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/member'))}>
                    <Image source={getIcon('back', colors.mode)} style={styles.headerBackIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isRegisterMode ? '註冊帳號' : '登入'}</Text>
            </View>

            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Image source={require('../img/Meeeee.png')} style={styles.logo} />
                <Text style={styles.title}>{isRegisterMode ? '建立新帳號' : '歡迎回來'}</Text>
                <Text style={styles.subtitle}>
                    {isRegisterMode ? '註冊帳號以同步你的食譜與日誌' : '登入以同步你的食譜與日誌'}
                </Text>

                {isRegisterMode && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>暱稱</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="請輸入暱稱"
                            placeholderTextColor={colors.gray}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="none"
                        />
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>電子郵件</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="example@email.com"
                        placeholderTextColor={colors.gray}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>密碼</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="至少 6 個字元"
                        placeholderTextColor={colors.gray}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <ActivityIndicator color={colors.surface} />
                    ) : (
                        <Text style={styles.submitButtonText}>{isRegisterMode ? '註冊' : '登入'}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.switchModeButton} onPress={() => setIsRegisterMode((prev) => !prev)}>
                    <Text style={styles.switchModeText}>
                        {isRegisterMode ? '已經有帳號了？前往登入' : '還沒有帳號？前往註冊'}
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    headerBackIcon: { width: 28, height: 28 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.subtleText, marginLeft: 8 },
    content: { flex: 1, paddingHorizontal: 30, alignItems: 'center', paddingTop: 10 },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: colors.dark,
        marginBottom: 16,
    },
    title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    subtitle: { fontSize: 13, color: colors.muted, marginBottom: 24, textAlign: 'center' },
    inputGroup: { width: '100%', marginBottom: 16 },
    label: { fontSize: 13, color: colors.subtleText, marginBottom: 6, fontWeight: '600' },
    input: {
        width: '100%',
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 14,
        fontSize: 15,
        color: colors.inputText,
        backgroundColor: colors.surfaceAlt,
    },
    submitButton: {
        width: '100%',
        backgroundColor: colors.text,
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
    switchModeButton: { marginTop: 16, padding: 8 },
    switchModeText: { color: colors.muted, fontSize: 13 },
});
