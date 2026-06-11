# Recipe App — Project Guide

## 專案概述

一個食譜 App，使用 React Native + Expo 開發。
目標平台：iOS & Android

## 技術棧

- React Native (Expo)
- JavaScript
- 狀態管理：Zustand（位於 /store）
- 導航：Expo Router（file-based routing）
- UI 元件庫：NativeWind
- 後端/資料：Firebase

## 專案結構

RN-MIDTERM/
  app/                    # Expo Router 頁面（file-based routing）
    _layout.jsx           # 根路由 layout
    index.jsx             # 首頁
    detail.jsx            # 食譜詳情頁
    diary.jsx             # 日誌本
    diaryLog.jsx          # 日誌紀錄
    favorite.jsx          # 收藏頁
    member.jsx            # 個人頁面
    record.jsx            # 烘焙紀錄頁
  img/                    # 圖片資源
  store/                  # Zustand 狀態管理
  developing.jsx          # 開發中暫存頁面
  app.json
  package.json

## 已完成頁面

- [X] 首頁（index.jsx）
- [X] 食譜詳情頁（detail.jsx）— 尚未連接個人頭像功能
- [X] 烘焙紀錄頁（record.jsx）— 排版需調整
- [X] 日誌本（diary.jsx + diaryLog.jsx）— 分類功能尚未實作

## 待完成頁面

- [ ] 首頁搜尋欄（index.jsx 內新增）
- [ ] 收藏頁（favorite.jsx）
- [ ] 個人頁面（member.jsx）

## 設計規範

- 主色：#F8ECDF（米白/奶油色）
- 圖片資源位於 /img

## 注意事項

- 使用 Expo Router（非 React Navigation），路由以 app/ 資料夾結構為準
- 元件用 functional component + hooks
- 狀態統一透過 /store 的 Zustand 管理
- 新頁面開發中先放 developing.jsx，完成後移至 app/
