import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBXJQZ_tkzbF9FxTw093ZzAujBcgcH0tgg',
  authDomain: 'space-c3330.firebaseapp.com',
  projectId: 'space-c3330',
  storageBucket: 'space-c3330.firebasestorage.app',
  messagingSenderId: '455525555076',
  appId: '1:455525555076:web:9f4410f2c43cb73fa01bd1',
  measurementId: 'G-BNV89EJ8K5',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let authInstance;
if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // 已經初始化過時 initializeAuth 會拋錯，改用 getAuth 取得既有實例
    authInstance = getAuth(app);
  }
}

export const auth = authInstance;
