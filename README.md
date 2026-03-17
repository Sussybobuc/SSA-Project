# Bright Ways — Dev Notes

## Todo List
- ~~Fix the Forum (Diễn Đàn) Button not working in Introduction (Giới Thiệu) page, Quiz page and questions.html page~~ ✅ Fixed
- ~~Fix the Date not showing properly in the AI chat page and Quiz page~~ ✅ Fixed (styling now matches other pages)
- ~~Make the Nav bar consistent between web pages~~ ✅ Fixed
- If possible create a backend for Forum (Allow saving data on the server Azure) and an api slot for the AI chat page (Allow for quick switch AI api) — Backend exists at `backend/server.js`; see Azure guide below
- Research on how to run a backend server on Azure — See Azure deployment guide below
- Create a detail doc of how to set up a website with backend on Azure (With AI API imported into the AI chat) — See Azure deployment guide below





## ✅ Done - Everything that has been done last week

- Top bar navigation on all pages
  - Back / Forward / Reload buttons
  - Live date display
- AI Chat page (`career.html`) — full chat UI with history sidebar
- Quiz system — 8 major tracks (CNTT, SE, AI, IA, IC, AS, IS, GD)
- Dark mode — persists across all pages via localStorage
- Mobile responsive navbar (hamburger menu)
- Background music with toggle button
- Chat history restore now rebuilds full conversation on reload
- Chat sidebar has `+ Chat mới` to start a fresh chat view (without deleting history)
- Index disabled-major cards now use cleaner responsive placeholder layout
- Standalone forum pretest page added at `Forum section/forum-pretest.html`
- Forum pretest upgraded to feed-first UX with collapsible composer drawer + responsive animations
- Forum pretest category UX upgraded to animated chips (composer + feed filter)
- Separate Chill / Shit-post zone added inside forum pretest
- Lightweight local login/profile added for forum comments (username or anonymous)
- Forum pretest now supports dark/light mode + admin moderation login
- Theme toggle simplified to stable blurry-black style (removed buggy gradient effect)
- Forum body background cleaned to flat token (`var(--bg)`) to remove unintended gradient tint
- Composer backdrop retuned to neutral black blur overlay (no color bleed)
- Admin delete actions now use custom in-app confirmation popup (no stock browser confirm)
- Comments now expand inline (scroll-down panel) when clicking the comment button
- Report button added per thread with inline report form

## 🐛 Bugs Fixed

- **Navbar layout broken** on all pages after adding nav controls — missing CSS for `.nav-left`, `.nav-right`, `.nav-controls`, `.nav-btn`, `.nav-date`
- **Chat page layout** — double offset (`margin-top` + `padding-top`) pushed input bar off screen
- **History sidebar** covered the navbar (`top: 0` → fixed to `top: 70px`)
- **Date display empty** on `about.html` and `question.html` — `updateNavDate()` was missing from `script.js`
- **Duplicate `case 'IA'`** in `quiz.js` switch — dead code removed
- **Dark mode toggle button** rendered as a full-width bar — global `button { width: 420px }` was overriding `.theme-btn`; fixed with `width: auto`
- **Missing `<meta viewport>`** on `index.html`, `question.html`, `career.html` — mobile layout was broken
- **`loadChatHistory()` was empty** — chat history was saved to localStorage but never displayed on page reload; now restores last conversation
- **Duplicate `* {}` transition rules** in `chat.css` — second rule was silently overriding the first
- **Chat input had no length limit** — added 500-character cap (JS + HTML `maxlength`)
- **Chat history restore only loaded the last pair** — now restores full chronological conversation
- **Disabled-major layout looked broken/stacked** — fixed container/grid and improved placeholder styling

## ⚡ QoL Improvements Added

- **Toast notifications** in quiz — replaced ugly browser `alert()` dialogs with styled toasts
- **Live progress counter** — shows "X / 20 câu đã trả lời" and turns green when complete
- **Dark mode** on all pages — toggle button injected automatically on pages that didn't have one
- **Disabled-major UX polish** — added clear "Đang phát triển" badges and stable disabled button states

## 📋 TODO — Next Up

### High Priority
- [x] **Forum ("Slave dungeon")** — ✅ Backend at `backend/server.js`; frontend at `Forum section/forum.html`; see Azure guide to deploy
- [x] **AI status indicator** in chat navbar — ✅ Shows 🟡/🟢/🔴 status badge in chat header

### Medium Priority
- [ ] **Better Index layout** — the main page columns could use a horizontal scroll card layout on mobile instead of stacking
- [x] **Color themes** — ✅ Added amber (default), blue, purple theme dots (bottom-right picker, persists in localStorage)
- [x] **Quiz result sharing** — ✅ "📋 Sao chép kết quả" button copies result text to clipboard

### Low Priority / Polish
- [x] **Easter egg** — ✅ Konami Code: ↑↑↓↓←→←→BA on any page
- [x] **Accessibility pass** — ✅ `aria-label`, `aria-expanded` on hamburger; `aria-current="page"` on active nav; `role` attributes; `focus-visible` outlines
- [ ] **Server: environment config** — hardcoded `localhost:11434` and `llama3:8b` in `chat.js` should move to a config; admin password in `server.js` should be env var (already supports `FORUM_ADMIN_PASSWORD`)

## 🧩 Forum Module Outline

### 1) Scope (MVP)
- Anonymous/student nickname posting
- Categories: `Hỏi đáp chuyên ngành`, `Kinh nghiệm học tập`, `Cơ hội nghề nghiệp`
- Create post, comment, like, basic report button

### 2) Backend (Express + JSON/DB)
- Suggested entities:
  - `users` (id, display_name, role)
  - `threads` (id, title, content, category, author_id, created_at, updated_at)
  - `comments` (id, thread_id, content, author_id, created_at)
  - `reactions` (id, thread_id/comment_id, user_id, type)
- API routes:
  - `GET /forum/threads`
  - `POST /forum/threads`
  - `GET /forum/threads/:id`
  - `POST /forum/threads/:id/comments`
  - `POST /forum/report`

### 3) Frontend
- New page: `Forum section/forum.html`
- Components:
  - Thread list + category filter
  - Thread detail view + comments
  - Create thread modal/form
- Reuse existing navbar/theme patterns

### 4) Moderation & Safety
- Profanity filter (keyword list MVP)
- Rate limit posting/commenting (cooldown)
- Admin-only delete/hide endpoint (simple role check)

### 5) Rollout Plan
- Phase 1: read-only thread list + detail
- Phase 2: create thread + comments
- Phase 3: report/moderation + likes

## 🛠️ Forum Backend (MVP scaffold added)

- File: `backend/server.js`
- Runtime: Node.js (no external package needed)
- Storage: `backend/data/forum.json` (auto-created on first run)

Run:
- `node backend/server.js`

Default:
- Base URL: `http://localhost:3001`
- Admin header: `X-Admin-Password: admin123` (override with env `FORUM_ADMIN_PASSWORD`)

Routes:
- `GET /health`
- `GET /forum/threads?zone=main|chill&category=...`
- `GET /forum/threads/:id`
- `POST /forum/threads`
- `POST /forum/threads/:id/comments`
- `POST /forum/threads/:id/like`
- `DELETE /forum/threads/:id` (admin)
- `DELETE /forum/threads/:threadId/comments/:commentId` (admin)
- `POST /forum/report`

Quick test (PowerShell):
- `Invoke-RestMethod http://localhost:3001/health`
- `Invoke-RestMethod http://localhost:3001/forum/threads`
- `Invoke-RestMethod -Method Post -Uri http://localhost:3001/forum/threads -ContentType 'application/json' -Body '{"zone":"main","title":"Test","category":"Hỏi đáp chuyên ngành","content":"Hello"}'`
- `Invoke-RestMethod -Method Post -Uri http://localhost:3001/forum/report -ContentType 'application/json' -Body '{"threadId":"seed-main-1","reason":"Spam"}'`

## 🧪 Forum Pretest Page (Not wired into main flow yet)

- Path: `Forum section/forum-pretest.html`
- Purpose: thử nghiệm UI/logic forum trước khi tích hợp vào dự án chính
- Data mode: localStorage (`brightways_forum_pretest_v1`)
- Current features:
  - Feed-first layout (mở trang là thấy thread list trước)
  - Tách riêng 2 khu vực: `Forum chính` và `Chill / Shit-post`
  - Form tạo chủ đề dạng collapsible drawer (nút `+ Tạo chủ đề`)
  - Chọn khu vực đăng bài ngay trong composer drawer
  - Local profile modal để đặt username + mặc định ẩn danh
  - Bình luận hiển thị username hoặc `Ẩn danh` theo lựa chọn
  - Toggle dark/light mode (đồng bộ key `theme` với main project)
  - Nút theme dùng style blurry-black ổn định (không còn gradient animation bug)
  - Nền trang forum dùng màu phẳng `var(--bg)` (đã bỏ gradient gây lỗi)
  - Composer backdrop dùng overlay đen + blur nhẹ để tránh ám màu nền
  - Admin login local để bật chế độ moderation
  - Admin có thể xóa bài viết và xóa bình luận
  - Xác nhận xóa bằng popup custom trong app (thay `confirm()` mặc định)
  - Bình luận mở theo dạng scroll-down inline panel khi bấm nút `💬 ... bình luận`
  - Có nút `🚩 Report` cho từng thread + form report ngay trong panel
  - Backdrop + đóng drawer bằng nút `✕` hoặc phím `Esc`
  - Chọn danh mục bằng animated chips (thay cho select thô)
  - Lọc feed theo zone + category chips trực tiếp trên header
  - Tạo chủ đề theo danh mục
  - Lọc chủ đề theo danh mục
  - Like chủ đề
  - Bình luận theo từng chủ đề
  - Animation nhẹ cho thread card + hover micro-interactions
  - Seed dữ liệu mẫu lần chạy đầu

---

## ✅ Changes Made This Session (Copilot)

### Bug Fixes
- **Forum nav link missing** — Added "Diễn đàn" nav link to `about.html`, `question.html`, and `Quiz section/quiz.html`
- **Date display inconsistency** — Replaced the minimal `.nav-date` style in `chat.css` and `quiz.css` with the full pill style from `style.css` (amber background, border-radius, backdrop-blur, absolute-centered)
- **Forum API not connecting** — Fixed `API_BASE` in `forum.js`; now auto-detects environment:
  - `http://localhost:3001` when running locally
  - `https://ssa-project.azurewebsites.net` when deployed to Azure
- **Forum hamburger broken** — `forum.js` had no hamburger toggle handler at all; added full setup with aria support
- **Hamburger not keyboard accessible** — All pages now support `Enter`/`Space` to toggle menu

### New Features
- **AI status badge** — `#aiStatusBadge` in `career.html` chat header; shows 🟡 Checking → 🟢 Online / 🔴 Offline by pinging `/chat` on page load
- **Quiz result copy button** — "📋 Sao chép kết quả" button inside `#resultBox`; copies career result to clipboard
- **Color themes** — Three color presets (amber/blue/purple) in a fixed bottom-right dot picker; injected on all pages; persists via `localStorage` key `color-theme`
- **Easter egg** — Konami Code (↑↑↓↓←→←→BA) on every page; shows a fun popup for 8 seconds
- **Accessibility** — `aria-label`, `aria-expanded`, `role="menubar"`, `tabindex="0"`, `aria-current="page"`, `focus-visible` outlines on all pages

### Infrastructure
- Added `package.json` at project root — required for Azure App Service Node.js `npm start` deployment
  - `npm start` runs `node backend/server.js`

---

## ☁️ Azure Deployment Guide

The project already has three GitHub Actions workflows:

| File | Service | What it deploys |
|------|---------|-----------------|
| `.github/workflows/azure-static-web-apps-lively-bay-0c2d2cd00.yml` | Azure Static Web Apps | HTML/CSS/JS frontend |
| `.github/workflows/main_ssa-project.yml` | Azure App Service (Node.js) | `backend/server.js` forum API |
| `.github/workflows/main_brightway.yml` | Azure App Service (ASP.NET) | ⚠️ Appears to be a leftover template — no .NET code exists; consider deleting |

### Step-by-Step: Deploy the Forum Backend to Azure

1. **Azure App Service** — already configured for Node.js in `main_ssa-project.yml`  
   The `package.json` added this session enables the `npm install` + `npm start` steps.

2. **Set environment variables** in Azure App Service → Configuration → Application Settings:
   | Key | Value |
   |-----|-------|
   | `PORT` | `8080` (Azure sets this automatically; `server.js` already reads it) |
   | `FORUM_ADMIN_PASSWORD` | a secure password (replaces the default `admin123`) |

3. **Update `forum.js` if App Service name changes** — the production URL is currently hardcoded as:
   ```
   https://ssa-project.azurewebsites.net
   ```
   If your Azure App Service is named something different, update the URL in `Forum section/forum.js`.

4. **CORS** — `server.js` already sends `Access-Control-Allow-Origin: *`. For production, narrow this to your Static Web App URL.

### Step-by-Step: Deploy the AI Chat Backend

The AI chat (`chat.js`) POSTs to a relative URL `/chat`. This means:
- **Locally**: You need a proxy or run the chat backend on the same port as a web server
- **Azure Static Web Apps**: You can use [Azure Static Web Apps API (linked Functions)](https://learn.microsoft.com/en-us/azure/static-web-apps/add-api) to proxy `/api/chat` → your Ollama or OpenAI endpoint
- **Alternatively**: Host Ollama on an Azure VM or Azure Container Instance; update the URL in `chat.js`

### Local Development
```bash
# Start forum backend
node backend/server.js

# Or with npm
npm start

# Then open any HTML file in a browser (or use Live Server extension in VS Code)
```

---

## 🔮 Future Improvements

These are suggestions for what to work on next:

### Security (Important)
- **Move admin password out of client code** — `ADMIN_PASSWORD` is currently visible in `forum.js` client-side JS. Anyone can open DevTools and see it. Real fix: use a login endpoint that returns a session token; never expose the password to the browser.
- **CORS restriction** — Narrow `Access-Control-Allow-Origin: *` in `server.js` to the production domain once deployed.

### Features
- **Persistent storage for forum** — Currently uses `backend/data/forum.json` (flat file). For multi-user production use, consider:
  - [Azure Cosmos DB](https://learn.microsoft.com/en-us/azure/cosmos-db/) (free tier available, JSON-native)
  - [Azure Database for MySQL/PostgreSQL](https://learn.microsoft.com/en-us/azure/mysql/)
- **User accounts** — Currently all posts are anonymous or use a local nickname. Add proper auth (e.g. Google OAuth or Azure AD B2C).
- **AI API switching** — The `chat.js` has the Ollama URL hardcoded. Add a config panel (admin-only) to switch between Ollama, OpenAI, or other providers.
- **Better Index layout** — Main page card columns should horizontally scroll on mobile.
- **Forum integration** — `forum-pretest.html` (localStorage version) and `forum.html` (API version) should be merged into one final build.

### Performance
- **No CDN for assets** — All CSS/JS files are local. For production consider bundling (e.g. Vite or Parcel) and hosting on Azure CDN.
- **forum.json grows indefinitely** — Add a maximum thread count or archiving logic.

### Deployment
- **Delete `main_brightway.yml`** — It deploys an ASP.NET app but there is no .NET code in this project. It will fail every deploy and waste CI minutes.
- **Environment config** — `localhost:11434` (Ollama) and `llama3:8b` are hardcoded in `chat.js`. Move to a `.env` file and read at build/deploy time.

