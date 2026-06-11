# 食焙's — 烘焙食譜 App
### React Native + Expo 期中報告

---

## 專案簡介

- 一款專為烘焙愛好者設計的食譜紀錄 App
- 核心功能：食譜瀏覽、烘焙紀錄撰寫、日誌本管理、收藏、個人化設定
- 平台：iOS / Android / Web（Expo）

---

## 技術棧

React Native、React、Expo（Expo Router）、Zustand、Firebase Authentication、Groq AI API、AsyncStorage、Expo File System、Expo Image Picker、Expo Audio、React Native Animated API、React Native Safe Area Context

---

## 導覽架構：Expo Router

- File-based routing：`app/` 資料夾結構即路由
- 主要頁面：首頁、詳情頁、烘焙紀錄、日誌本、收藏、個人頁、登入
- 底部導覽列 + Stack 導航 + 動態路由參數（如 `detail.jsx?id=...`）
- 編輯/撰寫類頁面（record、AI 生成）隱藏底部導覽列，讓使用者專注內容

---

## 狀態管理：Zustand

| Store | 負責內容 |
|---|---|
| `recipeStore` | 食譜、日誌本、收藏、草稿、通知設定 |
| `authStore` | 登入 / 註冊 / 登出（串接 Firebase） |
| `themeStore` | Light / Dark 主題色彩 |
| `profileStore` | 使用者頭像 |

- 搭配 `persist` middleware + AsyncStorage 做本地持久化
- 登出 / 重新整理 / 訪客→登入時自動重置資料，避免資料污染

---

## 功能：首頁與食譜

- 食譜分類瀏覽、搜尋欄
- 食譜詳情頁：食材、步驟、烤溫時間、滿意度
- 收藏功能（愛心動畫按鈕）
- 食譜與日誌本資料結構分離：
  - `category != null` → 真正食譜
  - `category == null` → 日誌本

---

## 功能：日誌本

- 使用者可建立日誌本，並透過「加入食譜」將既有食譜加入日誌本
- 透過 `recipeIds` 連結日誌本與食譜（不重複建立資料）
- 長按可移除日誌本中的食譜

---

## 功能：烘焙紀錄

- 新增 / 編輯 / 草稿三種模式
- 圖片上傳（封面 + 步驟圖）
- 分類、權限、滿意度、烤溫設定
- 編輯時自動隱藏底部導覽列，聚焦輸入

---

## 功能：個人頁面

- 登入後可更換頭像（Expo Image Picker）
- 訪客模式：顯示「訪客」、頭像不可更換
- 統計數據：烘焙次數、收藏食譜數、日誌本數
- 深色模式切換（含淡入淡出動畫）

---

## Light / Dark Mode

- `themeStore` 統一管理主題色彩
- 所有圖示提供 light / dark 雙版本（`utils/icons.js`）
- 輸入文字顏色（`inputText`）依模式自動調整，確保深色模式可讀性

---

## 動畫設計

- `AnimatedHeartButton`：收藏愛心彈跳效果
- `AnimatedTouchable`：按鈕點擊回饋
- `IntroAnimation`：啟動畫面動畫
- 深色模式切換淡入淡出、計時器到時閃爍、圖示旋轉

---

## 本地儲存（LocalStorage）

- AsyncStorage + Zustand `persist`
- Expo File System：圖片持久化儲存（頭像、食譜照片）
- App 重新整理 / 登出時自動重置為初始狀態

---

## 加分功能：AI 食譜生成（測試版）

- 串接 **Groq AI API**（llama-3.3-70b-versatile）
- 透過 4 個問題（甜點類型、現有食材、製作時間、特殊需求）
- AI 生成完整食譜（標題、分類、食材、步驟、烤溫、小提示）
- 一鍵儲存為草稿並進入編輯頁面

---

## 帳號系統

- Firebase Authentication（Email / 密碼）
- 訪客模式與登入帳號資料完全隔離
- 註冊 / 登出皆會重置使用者資料，避免資料殘留

---

## 未來規劃

- 接入外部食譜 / 營養資訊 API（Spoonacular、Edamam）
- 強化 AI 推薦（依收藏紀錄個人化推薦）
- 分享功能完善
- 通知提醒功能擴充

---

## Q&A

謝謝聆聽！
