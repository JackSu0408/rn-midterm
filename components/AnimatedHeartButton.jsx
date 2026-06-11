import React, { useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../store/themeStore';
import { getIcon } from '../utils/icons';

// 收藏愛心按鈕：點擊時放大再彈回 (pop 效果)
export default function AnimatedHeartButton({ isFavorite, onPress, style, iconStyle }) {
    const colors = useThemeColors();
    const scale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scale, { toValue: 1.4, duration: 120, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3, tension: 140 }),
        ]).start();
        onPress();
    };

    return (
        <TouchableOpacity style={style} onPress={handlePress}>
            <Animated.Image
                source={isFavorite ? require('../img/love.png') : getIcon('fav_0', colors.mode)}
                style={[iconStyle, { transform: [{ scale }] }]}
            />
        </TouchableOpacity>
    );
}
