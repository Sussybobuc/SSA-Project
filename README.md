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

## ⚡ QoL Improvements Added

- **Toast notifications** in quiz — replaced ugly browser `alert()` dialogs with styled toasts
- **Live progress counter** — shows "X / 20 câu đã trả lời" and turns green when complete
- **Dark mode** on all pages — toggle button injected automatically on pages that didn't have one

## 📋 TODO — Next Up

### High Priority
- [ ] **Forum ("Slave dungeon")** — completely unbuilt; needs backend (Express routes + data storage)
- [ ] **Fix layout for disabled majors** on Index — the 4 grayed-out columns (Truyền thông, Ngôn ngữ, Luật, Quản trị) need real content or a better placeholder design
- [ ] **AI status indicator** in chat navbar — show whether Ollama is online/offline before user sends a message

### Medium Priority
- [ ] **Better Index layout** — the main page columns could use a horizontal scroll card layout on mobile instead of stacking
- [ ] **Color themes** — add 2–3 theme presets (e.g. blue, purple, green) on top of the existing dark/light toggle
- [ ] **Quiz result sharing** — let users copy/share their result (e.g. "I got Software Engineering!")
- [ ] **Chat: proper history restore** — currently restores only the last conversation; could show a "New chat" button and let users pick from sidebar history

### Low Priority / Polish
- [ ] **Easter egg** — still not implemented 🥚
- [ ] **Accessibility pass** — add `aria-label`, `aria-expanded` to hamburger, `aria-current="page"` to active nav link, focus-visible outlines for keyboard users
- [ ] **Quiz for remaining majors** — CNTT, SE, AI, IA, IC, AS, IS, GD are done; other faculties (Truyền thông, Ngôn ngữ, Luật, Quản trị) quizzes not started
- [ ] **Server: environment config** — hardcoded `localhost:11434` and `llama3:8b` should move to a `.env` file
