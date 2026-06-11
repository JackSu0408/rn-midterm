import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

// 通用的「按下縮小、放開彈回」互動回饋包裝元件
export default function AnimatedTouchable({
    onPress,
    onLongPress,
    delayLongPress,
    style,
    children,
    scaleTo = 0.95,
    disabled,
    ...rest
}) {
    const scale = useRef(new Animated.Value(1)).current;

    const animateTo = (toValue) => {
        Animated.spring(scale, {
            toValue,
            useNativeDriver: true,
            speed: 30,
            bounciness: 6,
        }).start();
    };

    const flatStyle = StyleSheet.flatten(style) || {};
    const { flexDirection, alignItems, justifyContent } = flatStyle;

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={delayLongPress}
            disabled={disabled}
            onPressIn={() => animateTo(scaleTo)}
            onPressOut={() => animateTo(1)}
            style={style}
            {...rest}
        >
            <Animated.View
                style={{
                    width: '100%',
                    flexDirection,
                    alignItems,
                    justifyContent,
                    transform: [{ scale }],
                }}
            >
                {children}
            </Animated.View>
        </Pressable>
    );
}
