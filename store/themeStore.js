import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightTheme = {
  mode: 'light',
  light: '#F8ECDF',
  mid: '#E2B59A',
  dark: '#B77466',
  text: '#693F27',
  black: '#212121',
  surface: '#FFFFFF',
  surfaceAlt: '#FFF7EB',
  surfaceSoft: '#F0E6DC',
  border: '#D7CCC8',
  muted: '#8D6E63',
  hint: '#A1887F',
  subtleText: '#5D4037',
  strongText: '#4E342E',
  deepText: '#3E2723',
  gray: '#A0A0A0',
  grayDark: '#666666',
  placeholder: '#D9D9D9',
  dateText: '#999999',
  avatarBg: '#E0D6CC',
  accentOrange: '#F5A623',
  fab: '#1A1A1A',
  inputText: '#5D4037',
};

export const darkTheme = {
  mode: 'dark',
  light: '#5e5042',
  mid: '#7A6B58',
  dark: '#4A3D32',
  text: '#F8ECDF',
  black: '#F5EDE4',
  surface: '#786A5A',
  surfaceAlt: '#6E5F4F',
  surfaceSoft: '#6E5F4F',
  border: '#6E6052',
  muted: '#C9BCAE',
  hint: '#C9BCAE',
  subtleText: '#EDE0D4',
  strongText: '#F5EDE4',
  deepText: '#F5EDE4',
  gray: '#B0A299',
  grayDark: '#C9BCAE',
  placeholder: '#6E6052',
  dateText: '#B0A299',
  avatarBg: '#6E5F4F',
  accentOrange: '#F5A623',
  fab: '#2A211A',
  inputText: '#FFFFFF',
};

export const useThemeStore = create(
  persist(
    (set) => ({
      mode: 'light',
      toggleTheme: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
      setTheme: (mode) => set({ mode }),
    }),
    {
      name: 'theme-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useThemeColors = () => {
  const mode = useThemeStore((state) => state.mode);
  return mode === 'dark' ? darkTheme : lightTheme;
};
