import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFE1AF' }, animation: 'fade' }}>
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