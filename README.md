# FinNews-Bot Frontend

AI 驅動的財經新聞推送系統前端應用，提供智能財經資訊篩選和個人化推送服務。

![FinNews-Bot](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-15.3.4-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-blue)

## ✨ 功能特色

### 🎯 核心功能
- **智能新聞篩選**：基於 AI 技術，精準過濾財經新聞
- **雙平台推送**：支援 Email 和 Discord 兩種推送方式
- **個人化設定**：自訂關鍵字、推送頻率和語言偏好
- **AI 語義分析**：智能關鍵字聚類和重複檢測
- **即時推送**：24/7 自動監控，第一時間推送重要資訊

### 🎨 設計特色
- **Claude 風格設計**：採用 Claude AI 的簡潔美學
- **響應式佈局**：完美適配桌面和行動裝置
- **現代化 UI**：流暢的動畫效果和直覺式操作
- **無障礙設計**：符合 WCAG 標準的使用者體驗

### 🔐 安全與驗證
- **Google OAuth**：安全的 Google 帳號登入
- **JWT Token**：自動化身份驗證
- **推送目標驗證**：Discord Webhook 和 Email 格式驗證
- **隱私保護**：敏感資訊遮罩顯示

## 🚀 快速開始

### 環境需求
- Node.js 18.0 或更高版本
- npm, yarn, pnpm 或 bun

### 安裝步驟

1. **複製專案**
```bash
git clone <repository-url>
cd finnews-bot-frontend
```

2. **安裝依賴**
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **環境設定**
```bash
cp env.example .env.local
```

編輯 `.env.local` 檔案：
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **啟動開發服務器**
```bash
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 📱 主要頁面

### 🏠 Landing Page (`/`)
- 產品介紹和價值主張
- 功能特色展示
- 立即開始使用引導

### 🚪 登入頁面 (`/login`)
- Google OAuth 整合
- 簡潔的登入流程
- 安全提醒和隱私說明

### 📊 儀表板 (`/dashboard`)
- 訂閱狀態概覽
- 推送統計數據
- 最近推送記錄
- 快速操作面板

### ⚙️ 設定頁面 (`/settings`)
- **訂閱管理**：創建、編輯、刪除訂閱
- **推送設定**：平台選擇、頻率設定、語言偏好
- **個人化設定**：AI 優化建議和引導流程

### 📝 記錄頁面 (`/records`)
- **推送歷史**：詳細的推送記錄檢視
- **統計分析**：使用數據和趨勢分析

### 🎯 個人化引導 (`/guidance`)
- 投資領域選擇
- 關鍵字設定和優化
- AI 語義分析結果
- 聚焦度評分

### ⚡ 快速設定 (`/quick-setup`)
- 30 秒完成基本設定
- 預設關鍵字選擇
- 簡化的 Discord 設定流程

## 🛠️ 技術架構

### 前端技術棧
- **Framework**: Next.js 15 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS v4
- **UI 組件**: Radix UI
- **狀態管理**: Custom Hooks + Context
- **驗證**: Supabase Auth
- **圖示**: Lucide React
- **通知**: Sonner (Toast)

### 設計系統
- **色彩**: Claude 橘色主調 (`oklch(0.65 0.15 35.6)`)
- **字體**: IBM Plex Sans + Inter
- **間距**: 基於 `0.75rem` 的等比系統
- **圓角**: 統一使用 `rounded-2xl` (12px)
- **動畫**: 流暢的過渡效果 (200ms)

### API 整合
- **HTTP Client**: 集中化 API 客戶端
- **錯誤處理**: 自動重試機制 (Render.com 冷啟動)
- **類型安全**: 完整的 TypeScript 類型定義
- **Token 管理**: 自動 JWT token 注入

## 📁 專案結構

```
src/
├── app/                    # Next.js App Router 頁面
├── components/            # React 組件
│   ├── ui/               # 基礎 UI 組件
│   ├── layout/           # 佈局組件
│   ├── subscription/     # 訂閱相關組件
│   └── guidance/         # 引導流程組件
├── hooks/                # 自訂 React Hooks
├── lib/                  # 工具函數和配置
└── styles/               # 全域樣式
```

## 🔧 開發命令

```bash
# 開發模式
npm run dev

# 生產構建
npm run build

# 啟動生產服務器
npm run start

# 程式碼檢查
npm run lint

# 類型檢查
npm run type-check
```

## 🌐 環境變數

| 變數名 | 描述 | 必需 |
|--------|------|------|
| `NEXT_PUBLIC_API_URL` | 後端 API 基礎 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名金鑰 | ✅ |

## 🎯 核心功能說明

### 智能推送系統
- **雙平台支援**：Email 優先，Discord 作為備選
- **推送格式優化**：Claude 風格的現代化設計
- **頻率控制**：每日 1-3 次的彈性設定
- **內容個人化**：基於用戶關鍵字和偏好

### 用戶體驗優化
- **30 秒快速設定**：新用戶友善的上手流程
- **智能預填**：自動填入 Google 帳號 Email
- **視覺回饋**：清晰的載入狀態和操作反饋
- **錯誤處理**：友善的錯誤提示和解決方案

### AI 個人化引導
- **投資領域分析**：多領域關鍵字推薦
- **語義聚類**：自動合併同義關鍵字
- **聚焦度評分**：量化推送內容精準度
- **持續優化**：基於使用行為調整推送策略

## 📋 更新日誌

### v2.1.0 (2024-12-12)
- ✨ 新增 Email 推送支援，優先於 Discord
- 🎨 重新設計推送格式，採用 Claude 風格
- 📱 修復 /guidance 頁面 RWD 問題
- 🔧 優化設定頁面的平台顯示邏輯
- 🚀 Email 欄位自動預填 Google 帳號
- 🛡️ 推送目標隱私保護顯示

### v2.0.0 (2024-12-11)
- 🎉 完整 UI/UX 重構，採用 Claude 設計系統
- 📱 全面響應式設計優化
- ⚡ 新增 30 秒快速設定流程
- 🎯 AI 個人化引導流程優化
- 📊 統一儀表板和記錄頁面
- 🔄 簡化導航結構為 3 個核心功能

## 🤝 貢獻

歡迎提交 Issues 和 Pull Requests！

## 📄 授權

本專案採用 MIT 授權條款。

## 📞 支援

如有問題或建議，請透過 GitHub Issues 聯繫我們。

---

**FinNews-Bot** - 讓 AI 為您精選最重要的財經資訊 📈
