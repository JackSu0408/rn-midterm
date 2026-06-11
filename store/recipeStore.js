import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialRecipes = {
  '1': {
    id: '1',
    title: '布朗尼',
    image: require('../img/brownie.png'),
    userName: 'RWei',
    userAvatar: require('../img/Meeeee.png'),
    satisfaction: '8★',
    note: '外酥內軟、巧克力香氣濃郁。',
    date: '2026.04.09',
    category: '其他',
    permission: '公開',
    ingredients: [
      { name: '黑巧克力', amount: '200g' },
      { name: '奶油', amount: '120g' },
      { name: '低筋麵粉', amount: '80g' },
    ],
    steps: ['巧克力與奶油隔水加熱融化。', '拌入材料後以 170°C 烘烤約 25 分鐘。'],
  },
  '2': {
    id: '2',
    title: '戚風蛋糕',
    image: require('../img/chiffon.png'),
    userName: 'XEX',
    userAvatar: require('../img/Meeeee.png'),
    satisfaction: '9★',
    note: '口感輕盈，回彈很好。',
    date: '2026.04.03',
    category: '蛋糕',
    permission: '公開',
    ingredients: [
      { name: '蛋', amount: '4 顆' },
      { name: '細砂糖', amount: '70g' },
      { name: '低筋麵粉', amount: '90g' },
    ],
    steps: ['蛋白打發至乾性發泡。', '與蛋黃麵糊拌勻後 160°C 烘烤 35 分鐘。'],
  },
  '3': {
    id: '3',
    title: '聖諾多黑',
    image: require('../img/puff.png'),
    userName: 'King',
    userAvatar: require('../img/Meeeee.png'),
    satisfaction: '7★',
    note: '焦糖上色漂亮，卡士達可再更濃。',
    date: '2026.04.01',
    category: '其他',
    permission: '公開',
    ingredients: [
      { name: '泡芙麵糊', amount: '1 份' },
      { name: '卡士達醬', amount: '250g' },
      { name: '焦糖', amount: '適量' },
    ],
    steps: ['先烤泡芙並填入卡士達。', '表面沾焦糖後組裝完成。'],
  },
  r1: {
    id: 'r1',
    title: '磅蛋糕',
    image: require('../img/poundcake.png'),
    userName: 'CuCu',
    userAvatar: require('../img/Meeeee.png'),
    satisfaction: '8★',
    note: '奶油香足，組織紮實濕潤。',
    date: '2026.03.29',
    category: '蛋糕',
    permission: '公開',
    ingredients: [
      { name: '奶油', amount: '150g' },
      { name: '細砂糖', amount: '120g' },
      { name: '蛋', amount: '3 顆' },
    ],
    steps: ['奶油與糖打發後分次加蛋。', '拌入粉類後 170°C 烘烤 45 分鐘。'],
  },
  r2: {
    id: 'r2',
    title: '蘋果奶酥',
    image: require('../img/crumble.png'),
    userName: 'Qian',
    userAvatar: require('../img/Meeeee.png'),
    satisfaction: '9★',
    note: '酸甜平衡，奶酥酥脆。',
    date: '2026.03.29',
    category: '其他',
    permission: '公開',
    ingredients: [
      { name: '蘋果', amount: '2 顆' },
      { name: '奶酥粒', amount: '150g' },
      { name: '肉桂粉', amount: '少許' },
    ],
    steps: ['蘋果切丁拌糖與肉桂。', '鋪上奶酥後 180°C 烘烤 30 分鐘。'],
  },
  r3: {
    id: 'r3',
    title: '軟餅乾',
    image: require('../img/cookies.png'),
    userName: 'JackSu',
    userAvatar: require('../img/Meeeee.png'),
    satisfaction: '8★',
    note: '邊緣微酥，中心柔軟。',
    date: '2026.03.28',
    category: '餅乾',
    permission: '公開',
    ingredients: [
      { name: '無鹽奶油', amount: '100g' },
      { name: '黑糖', amount: '80g' },
      { name: '巧克力豆', amount: '100g' },
    ],
    steps: ['材料拌勻後冷藏 20 分鐘。', '180°C 烘烤 10-12 分鐘。'],
  },
  'diary-basque': {
    id: 'diary-basque',
    title: '巴斯克蛋糕',
    image: require('../img/basque.png'),
    userName: 'DiaryUser',
    userAvatar: require('../img/Meeeee.png'),
    satisfaction: '9★',
    note: '表面焦香、中心濕潤，冷藏後口感更綿密。',
    date: '2026.04.08',
    category: '蛋糕',
    permission: '公開',
    ingredients: [
      { name: '奶油乳酪', amount: '250g' },
      { name: '鮮奶油', amount: '120g' },
      { name: '全蛋', amount: '2 顆' },
      { name: '細砂糖', amount: '70g' },
      { name: '低筋麵粉', amount: '10g' },
    ],
    steps: [
      '奶油乳酪與糖打至滑順後分次加入蛋液。',
      '加入鮮奶油與麵粉拌勻，倒入模具。',
      '以 220°C 烘烤約 22 分鐘至表面上色。',
    ],
  },
  'diary-cheesecake': {
    id: 'diary-cheesecake',
    title: '紐約重乳酪',
    image: require('../img/cheesecake.png'),
    userName: 'DiaryUser',
    userAvatar: require('../img/Meeeee.png'),
    satisfaction: '8★',
    note: '乳酪香氣濃厚，餅乾底酥脆，口感扎實。',
    date: '2026.04.08',
    category: '其他',
    permission: '公開',
    ingredients: [
      { name: '奶油乳酪', amount: '300g' },
      { name: '消化餅', amount: '120g' },
      { name: '無鹽奶油', amount: '55g' },
      { name: '全蛋', amount: '2 顆' },
      { name: '酸奶油', amount: '100g' },
    ],
    steps: [
      '消化餅壓碎拌融化奶油，鋪底冷藏定型。',
      '乳酪糊拌勻後倒入模具，外層包鋁箔。',
      '以水浴法 170°C 烘烤約 50 分鐘，冷藏一晚。',
    ],
  },
};

export const useRecipeStore = create(
  persist(
    (set, get) => ({
  recipes: initialRecipes,
  recentOrder: ['1', '2', '3'],
  rankingOrder: ['r1', 'r2', 'r3'],
  favorites: [],
  drafts: [],
  notificationSettings: {
    newRecipe: true,
    diaryReminder: true,
    marketing: false,
  },
  updateNotificationSettings: (payload) => {
    set((state) => ({
      notificationSettings: { ...state.notificationSettings, ...payload },
    }));
  },
  toggleFavorite: (id) => {
    const recipeId = String(id);
    set((state) => {
      const isFavorited = state.favorites.includes(recipeId);
      return {
        favorites: isFavorited
          ? state.favorites.filter((favoriteId) => favoriteId !== recipeId)
          : [...state.favorites, recipeId],
      };
    });
  },
  isFavorite: (id) => {
    return get().favorites.includes(String(id));
  },
  addRecipe: (payload) => {
    const id = `u${Date.now()}`;
    const recipe = {
      id,
      title: payload.title,
      image: payload.image,
      images: Array.isArray(payload.images) && payload.images.length > 0
        ? payload.images
        : (payload.image ? [payload.image] : []),
      userName: payload.userName,
      userAvatar: payload.userAvatar,
      satisfaction: payload.satisfaction,
      note: payload.note,
      date: payload.date,
      ingredients: payload.ingredients,
      steps: payload.steps,
      category: payload.category,
      permission: payload.permission,
    };

    set((state) => ({
      recipes: {
        ...state.recipes,
        [id]: recipe,
      },
      recentOrder: [id, ...state.recentOrder.filter((itemId) => itemId !== id)],
    }));

    return id;
  },
  updateRecipe: (id, payload) => {
    const recipeId = String(id);
    set((state) => {
      const existingRecipe = state.recipes[recipeId];
      if (!existingRecipe) {
        return {};
      }

      const nextImage = payload.image !== undefined ? payload.image : existingRecipe.image;
      const nextImages = Array.isArray(payload.images) && payload.images.length > 0
        ? payload.images
        : (nextImage ? [nextImage] : []);

      return {
        recipes: {
          ...state.recipes,
          [recipeId]: {
            ...existingRecipe,
            ...payload,
            id: recipeId,
            image: nextImage,
            images: nextImages,
          },
        },
        recentOrder: [recipeId, ...state.recentOrder.filter((itemId) => itemId !== recipeId)],
      };
    });
  },
  addRecipeToDiary: (diaryId, recipeId) => {
    const diaryKey = String(diaryId);
    const targetId = String(recipeId);
    set((state) => {
      const diary = state.recipes[diaryKey];
      if (!diary) {
        return {};
      }

      const existingIds = Array.isArray(diary.recipeIds) ? diary.recipeIds : [];
      if (existingIds.includes(targetId)) {
        return {};
      }

      return {
        recipes: {
          ...state.recipes,
          [diaryKey]: {
            ...diary,
            recipeIds: [...existingIds, targetId],
          },
        },
      };
    });
  },
  removeRecipeFromDiary: (diaryId, recipeId) => {
    const diaryKey = String(diaryId);
    const targetId = String(recipeId);
    set((state) => {
      const diary = state.recipes[diaryKey];
      if (!diary || !Array.isArray(diary.recipeIds)) {
        return {};
      }

      return {
        recipes: {
          ...state.recipes,
          [diaryKey]: {
            ...diary,
            recipeIds: diary.recipeIds.filter((id) => id !== targetId),
          },
        },
      };
    });
  },
  removeRecipe: (id) => {
    const recipeId = String(id);
    set((state) => {
      const nextRecipes = { ...state.recipes };
      delete nextRecipes[recipeId];

      Object.keys(nextRecipes).forEach((key) => {
        const recipe = nextRecipes[key];
        if (Array.isArray(recipe.recipeIds) && recipe.recipeIds.includes(recipeId)) {
          nextRecipes[key] = {
            ...recipe,
            recipeIds: recipe.recipeIds.filter((recipeIdEntry) => recipeIdEntry !== recipeId),
          };
        }
      });

      return {
        recipes: nextRecipes,
        recentOrder: state.recentOrder.filter((itemId) => itemId !== recipeId),
        rankingOrder: state.rankingOrder.filter((itemId) => itemId !== recipeId),
        favorites: state.favorites.filter((itemId) => itemId !== recipeId),
      };
    });
  },
  saveDraft: (draftId, payload) => {
    set((state) => {
      if (draftId) {
        const exists = state.drafts.some((draft) => draft.id === draftId);
        if (exists) {
          return {
            drafts: state.drafts.map((draft) =>
              draft.id === draftId ? { ...draft, ...payload, id: draftId } : draft
            ),
          };
        }
      }

      const newDraft = { ...payload, id: draftId || `draft-${Date.now()}` };
      return { drafts: [newDraft, ...state.drafts] };
    });
  },
  removeDraft: (draftId) => {
    set((state) => ({
      drafts: state.drafts.filter((draft) => draft.id !== draftId),
    }));
  },
  getDraftById: (draftId) => {
    return get().drafts.find((draft) => draft.id === draftId) || null;
  },
  resetUserData: () => {
    set({
      recipes: initialRecipes,
      recentOrder: ['1', '2', '3'],
      rankingOrder: ['r1', 'r2', 'r3'],
      favorites: [],
      drafts: [],
      notificationSettings: {
        newRecipe: true,
        diaryReminder: true,
        marketing: false,
      },
    });
  },
  getRecipeById: (id) => {
    const recipeId = Array.isArray(id) ? id[0] : String(id);
    const recipes = get().recipes;
    if (recipes[recipeId]) {
      return recipes[recipeId];
    }

    const firstRecipeId = Object.keys(recipes)[0];
    return firstRecipeId ? recipes[firstRecipeId] : null;
  },
    }),
    {
      name: 'recipe-store',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...persistedState };
        const recipes = { ...currentState.recipes };

        Object.entries(persistedState?.recipes || {}).forEach(([id, recipe]) => {
          const base = currentState.recipes[id];
          if (base) {
            // 預設食譜的圖片為 require() 資源編號，編號可能因程式碼變動而改變，
            // 因此一律以程式碼中的最新值為準，避免讀到舊編號造成圖片跑掉。
            const { image, images, userAvatar, ...rest } = recipe;
            recipes[id] = { ...base, ...rest };
          } else {
            recipes[id] = recipe;
          }
        });

        merged.recipes = recipes;
        return merged;
      },
      onRehydrateStorage: () => (state) => {
        state?.resetUserData?.();
      },
      partialize: (state) => ({
        recipes: state.recipes,
        recentOrder: state.recentOrder,
        rankingOrder: state.rankingOrder,
        favorites: state.favorites,
        drafts: state.drafts,
        notificationSettings: state.notificationSettings,
      }),
    }
  )
);
