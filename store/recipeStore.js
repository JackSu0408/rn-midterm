import { create } from 'zustand';

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

export const useRecipeStore = create((set, get) => ({
  recipes: initialRecipes,
  recentOrder: ['1', '2', '3'],
  rankingOrder: ['r1', 'r2', 'r3'],
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
  removeRecipe: (id) => {
    const recipeId = String(id);
    set((state) => {
      const nextRecipes = { ...state.recipes };
      delete nextRecipes[recipeId];

      return {
        recipes: nextRecipes,
        recentOrder: state.recentOrder.filter((itemId) => itemId !== recipeId),
        rankingOrder: state.rankingOrder.filter((itemId) => itemId !== recipeId),
      };
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
}));
