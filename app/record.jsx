import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const FormItem = ({ iconSource, label, placeholder }) => (
    <View style={styles.formItem}>
        <View style={styles.labelContainer}>
            <Image source={iconSource} style={styles.formIcon} />
            <Text style={styles.labelText}>{label} |</Text>
        </View>
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#A0A0A0"
        />
    </View>
);

const colors = {
  light: '#FFE1AF',
  mid: '#E2B59A',
  dark: '#B77466',
  text: '#693F27',
    black: '#212121',
};

export default function BakingRecordScreen() {
        const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                                <TouchableOpacity onPress={() => router.replace('/')}>
                                        <Image source={require('../img/back.png')} style={styles.headerBackIcon} />
                                </TouchableOpacity>
                <Text style={styles.headerTitle}>烘焙紀錄</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* 名稱輸入欄位 */}
                <View style={styles.nameContainer}>
                    <Text style={styles.namePrefix}>|</Text>
                    <TextInput style={styles.nameInput} placeholder="名稱" placeholderTextColor="#A0A0A0" />
                </View>

                {/* 各種表單項目 */}
                <FormItem iconSource={require('../img/shopping_cart_24dp_693F27_FILL0_wght400_GRAD0_opsz24.png')} label="食材" placeholder="" />
                <FormItem iconSource={require('../img/method.png')} label="作法" placeholder="" />
                <FormItem iconSource={require('../img/heat.png')} label="烤溫及時間" placeholder="" />
                <FormItem iconSource={require('../img/star.png')} label="滿意度" placeholder="" />
                <FormItem iconSource={require('../img/label.png')} label="標籤" placeholder="" />
                <FormItem iconSource={require('../img/note.png')} label="備註" placeholder="" />
                <FormItem iconSource={require('../img/lock.png')} label="權限" placeholder="" />
                <FormItem iconSource={require('../img/addphoto.png')} label="新增圖片" placeholder="" />

                {/* 儲存按鈕 */}
                <TouchableOpacity style={styles.saveButton}>
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
                      <TouchableOpacity style={styles.navItem} onPress={() => {}}>
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
                      <TouchableOpacity style={styles.navItem} onPress={() => {}}>
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
    nameContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    namePrefix: { fontSize: 28, color: '#5D4037', marginRight: 8 },
    nameInput: { fontSize: 24, fontWeight: 'bold', flex: 1 },
    formItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    labelContainer: { flexDirection: 'row', alignItems: 'center', width: 140 },
    formIcon: { width: 24, height: 24 },
    labelText: { fontSize: 18, color: '#5D4037', marginLeft: 10, fontWeight: '600' },
    input: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#D7CCC8', height: 40 },
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