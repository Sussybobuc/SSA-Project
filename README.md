# Bright Ways — Dev Notes

## ✅ Done

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

## 🐛 Bugs Fixed (this session)

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
- [ ] **Forum ("Slave dungeon")** — completely unbuilt; needs backend (Express routes + data storage)
- [ ] **AI status indicator** in chat navbar — show whether Ollama is online/offline before user sends a message

### Medium Priority
- [ ] **Better Index layout** — the main page columns could use a horizontal scroll card layout on mobile instead of stacking
- [ ] **Color themes** — add 2–3 theme presets (e.g. blue, purple, green) on top of the existing dark/light toggle
- [ ] **Quiz result sharing** — let users copy/share their result (e.g. "I got Software Engineering!")

### Low Priority / Polish
- [ ] **Easter egg** — still not implemented 🥚
- [ ] **Accessibility pass** — add `aria-label`, `aria-expanded` to hamburger, `aria-current="page"` to active nav link, focus-visible outlines for keyboard users
- [ ] **Server: environment config** — hardcoded `localhost:11434` and `llama3:8b` should move to a `.env` file

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
