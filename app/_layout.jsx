import { Stack } from 'expo-router';
import { useThemeColors } from '../store/themeStore';

export default function RootLayout() {
    const colors = useThemeColors();

    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.light }, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="record" />
            <Stack.Screen name="detail" />
            <Stack.Screen name="diary" />
            <Stack.Screen name="member" />
            <Stack.Screen name="favorite" />
            <Stack.Screen name="diaryLog" />
        </Stack>
    );
}
