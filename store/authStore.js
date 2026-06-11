import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useRecipeStore } from './recipeStore';
import { useProfileStore } from './profileStore';

const AUTH_ERROR_MESSAGES = {
  'auth/invalid-email': '電子郵件格式不正確。',
  'auth/missing-password': '請輸入密碼。',
  'auth/invalid-credential': '帳號或密碼錯誤。',
  'auth/wrong-password': '帳號或密碼錯誤。',
  'auth/user-not-found': '帳號或密碼錯誤。',
  'auth/email-already-in-use': '這個電子郵件已經被註冊過了。',
  'auth/weak-password': '密碼長度至少需要 6 個字元。',
  'auth/operation-not-allowed': '尚未啟用 Email/密碼登入方式，請至 Firebase 主控台開啟。',
  'auth/network-request-failed': '網路連線失敗，請檢查網路連線後再試一次。',
  'auth/configuration-not-found': '專案尚未啟用 Authentication 服務，請至 Firebase 主控台設定。',
  'auth/too-many-requests': '嘗試次數過多，請稍後再試。',
};

export const getAuthErrorMessage = (error) => {
  if (error?.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  return `發生錯誤，請稍後再試。${error?.code ? `（${error.code}）` : ''}`;
};

export const useAuthStore = create((set) => ({
  user: null,
  isReady: false,

  login: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  },

  register: async (email, password, displayName) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }
    set({ user: { ...credential.user, displayName } });
    useRecipeStore.getState().resetUserData();
    useProfileStore.getState().resetProfile();
  },

  logout: async () => {
    await signOut(auth);
    useRecipeStore.getState().resetUserData();
    useProfileStore.getState().resetProfile();
  },
}));

onAuthStateChanged(auth, (user) => {
  const { user: previousUser, isReady } = useAuthStore.getState();
  useAuthStore.setState({ user, isReady: true });

  // 訪客（未登入）時建立的資料不應帶入登入後的使用者資料中
  if (isReady && !previousUser && user) {
    useRecipeStore.getState().resetUserData();
    useProfileStore.getState().resetProfile();
  }
});
