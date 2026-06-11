import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet } from 'react-native';
import { useThemeColors } from '../store/themeStore';

const { width, height } = Dimensions.get('window');

// 開啟 App 時的進場動畫：周邊元素左右搖擺進場，最後大大的 S 滑順就定位
export default function IntroAnimation({ onFinish }) {
    const colors = useThemeColors();
    const styles = createStyles(colors);

    const shiX = useRef(new Animated.Value(-width)).current;
    const beiX = useRef(new Animated.Value(width)).current;
    const bakingX = useRef(new Animated.Value(-width)).current;
    const sTranslateY = useRef(new Animated.Value(-height * 0.6)).current;
    const sOpacity = useRef(new Animated.Value(0)).current;
    const overlayOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.stagger(150, [
                Animated.spring(shiX, { toValue: 0, friction: 4, tension: 30, useNativeDriver: true }),
                Animated.spring(beiX, { toValue: 0, friction: 4, tension: 30, useNativeDriver: true }),
                Animated.spring(bakingX, { toValue: 0, friction: 4, tension: 25, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(sOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(sTranslateY, {
                    toValue: 0,
                    duration: 700,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(450),
            Animated.timing(overlayOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start(() => onFinish && onFinish());
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: overlayOpacity }]} pointerEvents="none">
            <Animated.Text
                style={[styles.sText, { opacity: sOpacity, transform: [{ translateY: sTranslateY }] }]}
            >
                S
            </Animated.Text>
            <Animated.Text style={[styles.shiText, { transform: [{ translateX: shiX }] }]}>食</Animated.Text>
            <Animated.Text style={[styles.beiText, { transform: [{ translateX: beiX }] }]}>焙</Animated.Text>
            <Animated.Text style={[styles.bakingText, { transform: [{ translateX: bakingX }] }]}>
                Baking with U
            </Animated.Text>
        </Animated.View>
    );
}

const createStyles = (colors) => StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
        backgroundColor: colors.light,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sText: {
        position: 'absolute',
        fontSize: 240,
        fontWeight: '900',
        fontStyle: 'italic',
        color: colors.dark,
    },
    shiText: {
        position: 'absolute',
        top: '20%',
        right: '20%',
        fontSize: 56,
        fontWeight: 'bold',
        color: colors.text,
    },
    beiText: {
        position: 'absolute',
        bottom: '18%',
        right: '16%',
        fontSize: 88,
        fontWeight: 'bold',
        color: colors.text,
    },
    bakingText: {
        position: 'absolute',
        top: '47%',
        fontSize: 22,
        fontStyle: 'italic',
        fontWeight: '600',
        color: colors.text,
    },
});
