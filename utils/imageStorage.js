import { Directory, File, Paths } from 'expo-file-system';

const recipeImagesDir = new Directory(Paths.document, 'recipe-images');

const ensureDir = () => {
    if (!recipeImagesDir.exists) {
        recipeImagesDir.create({ intermediates: true, idempotent: true });
    }
};

// 將 ImagePicker 回傳的暫存快取 uri 複製到永久目錄，避免重啟 App 後路徑失效導致圖片消失
export const persistImageAsync = (uri) => {
    if (!uri || !uri.startsWith('file')) {
        return uri;
    }

    try {
        ensureDir();

        const sourceFile = new File(uri);
        const extension = sourceFile.extension || '.jpg';
        const destFile = new File(recipeImagesDir, `${Date.now()}-${Math.round(Math.random() * 1e6)}${extension}`);

        sourceFile.copy(destFile);
        return destFile.uri;
    } catch (error) {
        console.warn('persistImageAsync failed:', error);
        return uri;
    }
};

// 將 { uri } 形式的圖片來源複製到永久目錄，其他型別（require 的本地資源）原樣回傳
export const persistImageSource = (source) => {
    if (source && typeof source === 'object' && source.uri) {
        return { uri: persistImageAsync(source.uri) };
    }
    return source;
};
