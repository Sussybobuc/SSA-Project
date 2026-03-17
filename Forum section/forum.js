const API_BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "http://localhost:3001"
  : "https://ssa-project.azurewebsites.net";
const USER_STORAGE_KEY = "brightways_forum_user_v1";
const ADMIN_STORAGE_KEY = "brightways_forum_admin_v1";
const ADMIN_PASSWORD = "admin123"; // In real app, dont store this in client code
const body = document.body;

const ZONE_CONFIG = {
  main: {
    label: "Forum chính",
    categories: ["Hỏi đáp chuyên ngành", "Kinh nghiệm học tập", "Cơ hội nghề nghiệp"]
  },
  chill: {
    label: "Chill / Shit-post",
    categories: ["Chém gió", "Meme", "Off-topic"]
  }
};

let activeZone = "main";
let activeFilter = "all";
let currentUser = loadUserProfile();
let isAdmin = loadAdminState();
let pendingDeleteAction = null;
let expandedThreadId = null; // Comments
let openReportId = null;     // Reports (New)
let threadsCache = [];

function loadUserProfile() {
  const saved = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || {};
  return {
    username: typeof saved.username === "string" ? saved.username.trim() : "",
    anonymousDefault: Boolean(saved.anonymousDefault)
  };
}

function saveUserProfile(profile) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
}

function loadAdminState() {
  return localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
}

function saveAdminState(value) {
  localStorage.setItem(ADMIN_STORAGE_KEY, value ? "true" : "false");
}

function getDisplayName() {
  return currentUser.username || "Khách";
}

function updateUserBadge() {
  const userBadge = document.getElementById("userBadge");
  if (!userBadge) return;
  userBadge.textContent = getDisplayName();
}

function updateAdminUI() {
  const adminBadge = document.getElementById("adminBadge");
  const adminToggle = document.getElementById("adminToggle");
  if (!adminBadge || !adminToggle) return;

  adminBadge.classList.toggle("hidden", !isAdmin);
  adminToggle.textContent = isAdmin ? "Admin logout" : "Admin";
}

function updateThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;
  themeToggle.textContent = body.classList.contains("dark") ? "☀️" : "🌙";
}

function initTheme() {
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark");
  }
  updateThemeToggle();
}

function updateDate() {
  const el = document.getElementById("navDate");
  if (!el) return;
  const now = new Date();
  const formatted = now.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  el.textContent = "📅 " + formatted;
}

function toggleTheme() {
  body.classList.toggle("dark");
  localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
  updateThemeToggle();
}

function formatTime(iso) {
  return new Date(iso).toLocaleString("vi-VN");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function setActiveChip(container, attr, value) {
  const chips = container.querySelectorAll(`[${attr}]`);
  chips.forEach((chip) => {
    chip.classList.toggle("active", chip.getAttribute(attr) === value);
  });
}

// --- API ACTIONS ---

async function fetchThreads() {
  try {
    const res = await fetch(`${API_BASE}/forum/threads?zone=${activeZone}`);
    const data = await res.json();
    threadsCache = data.threads || [];
    renderThreads();
  } catch (err) {
    console.error("Failed to load threads", err);
    document.getElementById("threadList").innerHTML = `<div class="empty">Không thể tải bài viết. Vui lòng thử lại sau.</div>`;
  }
}

async function addThread(title, zone, category, content) {
  try {
    const res = await fetch(`${API_BASE}/forum/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, zone, category, content })
    });
    if (res.ok) {
      showToast("Đăng bài thành công!");
      await fetchThreads();
    }
  } catch (err) {
    console.error(err);
  }
}

async function likeThread(threadId) {
  try {
    const res = await fetch(`${API_BASE}/forum/threads/${threadId}/like`, { method: "POST" });
    if (res.ok) await fetchThreads();
  } catch (err) {
    console.error(err);
  }
}

async function addComment(threadId, text, author, anonymous) {
  try {
    const res = await fetch(`${API_BASE}/forum/threads/${threadId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, author, anonymous })
    });
    if (res.ok) {
      showToast("Đã gửi bình luận.");
      await fetchThreads();
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteThread(threadId) {
  try {
    const res = await fetch(`${API_BASE}/forum/threads/${threadId}`, {
      method: "DELETE",
      headers: { "X-Admin-Password": ADMIN_PASSWORD }
    });
    if (res.ok) {
        showToast("Đã xóa bài viết.");
        if (expandedThreadId === threadId) expandedThreadId = null;
        await fetchThreads();
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteComment(threadId, commentId) {
  try {
    const res = await fetch(`${API_BASE}/forum/threads/${threadId}/comments/${commentId}`, {
      method: "DELETE",
      headers: { "X-Admin-Password": ADMIN_PASSWORD }
    });
    if (res.ok) {
      showToast("Đã xóa bình luận.");
      await fetchThreads();
    }
  } catch (err) {
    console.error(err);
  }
}

async function submitReport(threadId, reason, detail, reporter) {
  try {
    await fetch(`${API_BASE}/forum/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, reason, detail })
    });
  } catch (err) {
    console.error(err);
  }
}

// --- RENDERING ---

function renderFilterChips() {
  const filterCategoryGroup = document.getElementById("filterCategoryGroup");
  const categories = ZONE_CONFIG[activeZone].categories;

  filterCategoryGroup.innerHTML = [
    `<button type="button" class="category-chip ${activeFilter === "all" ? "active" : ""}" data-filter="all">Tất cả</button>`,
    ...categories.map((category) => {
      const activeClass = activeFilter === category ? "active" : "";
      return `<button type="button" class="category-chip ${activeClass}" data-filter="${category}">${category}</button>`;
    })
  ].join("");
}

function renderComposerCategories(zone, preferredCategory) {
  const threadCategoryGroup = document.getElementById("threadCategoryGroup");
  const threadCategoryInput = document.getElementById("threadCategory");
  const categories = ZONE_CONFIG[zone].categories;
  const selected = categories.includes(preferredCategory) ? preferredCategory : categories[0];

  threadCategoryGroup.innerHTML = categories.map((category) => {
    const activeClass = selected === category ? "active" : "";
    return `<button type="button" class="category-chip ${activeClass}" data-category="${category}">${category}</button>`;
  }).join("");

  threadCategoryInput.value = selected;
}

function renderThreads() {
  const threadList = document.getElementById("threadList");
  
  // Filter cache locally for category
  const categoryFiltered = activeFilter === "all"
    ? threadsCache
    : threadsCache.filter((thread) => thread.category === activeFilter);

  if (categoryFiltered.length === 0) {
    threadList.innerHTML = `<div class="empty">Chưa có bài viết nào ở khu vực <b>${ZONE_CONFIG[activeZone].label}</b>.</div>`;
    return;
  }

  threadList.innerHTML = categoryFiltered.map((thread, index) => {
    const isExpanded = expandedThreadId === thread.id;
    const isReportOpen = openReportId === thread.id;
    const commentToggleText = isExpanded ? "Ẩn bình luận" : `💬 ${thread.comments.length} bình luận`;
    const commentsMarkup = thread.comments.length === 0
      ? `<li class="comment-empty">Chưa có bình luận nào, hãy bắt đầu trước.</li>`
      : thread.comments.map((comment) => `
        <li>
          <span class="comment-author">${comment.anonymous ? "Ẩn danh" : escapeHtml(comment.author)}</span>:
          ${escapeHtml(comment.text)}
          <span class="comment-time">${formatTime(comment.createdAt)}</span>
          ${isAdmin ? `<button class="comment-delete-btn" data-delete-comment="${thread.id}:${comment.id}">Xóa</button>` : ""}
        </li>
      `).join("");

    return `
      <article class="thread-card ${thread.zone === "chill" ? "chill-card" : ""}" data-id="${thread.id}" style="animation-delay:${index * 45}ms">
        <div class="thread-meta">
          <span class="zone-tag ${thread.zone === "chill" ? "chill" : "main"}">${ZONE_CONFIG[thread.zone].label}</span>
          <span class="tag">${thread.category}</span>
          <span class="time">${formatTime(thread.createdAt)}</span>
        </div>
        <h3 class="thread-title">${escapeHtml(thread.title)}</h3>
        <p class="thread-content">${escapeHtml(thread.content)}</p>

        <div class="thread-actions">
          <button class="like-btn" data-like="${thread.id}">👍 ${thread.likes}</button>
          <button class="comment-toggle-btn" data-toggle-comments="${thread.id}">${commentToggleText}</button>
          <button class="report-toggle-btn" data-toggle-report="${thread.id}" title="Báo cáo vi phạm">⚠️</button>
          ${isAdmin ? `<button class="admin-delete-btn" data-delete-thread="${thread.id}">Xóa bài</button>` : ""}
        </div>

        <div class="thread-report-box ${isReportOpen ? "open" : ""}">
          <div class="thread-report-inner">
             <form class="report-form" data-report-form="${thread.id}">
              <textarea class="report-input" rows="1" maxlength="220" placeholder="Lý do báo cáo bài viết này..." required></textarea>
              <button class="report-submit" type="submit">Gửi report</button>
            </form>
          </div>
        </div>

        <div class="thread-detail ${isExpanded ? "open" : ""}">
          <div class="thread-detail-inner">
            <ul class="comment-list">${commentsMarkup}</ul>

            <form class="comment-form" data-comment-form="${thread.id}">
              <textarea class="comment-input" rows="1" maxlength="300" placeholder="Viết bình luận..." required></textarea>
              <label class="comment-anon">
                <input class="comment-anon-check" type="checkbox" ${currentUser.anonymousDefault ? "checked" : ""} />
                Ẩn danh
              </label>
              <button class="comment-submit" type="submit">Gửi</button>
            </form>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// --- UI MANAGERS ---

function openComposer() { body.classList.add("composer-open"); }
function closeComposer() { body.classList.remove("composer-open"); }
function toggleComposer() { body.classList.toggle("composer-open"); }

function openAuth() { body.classList.add("auth-open"); }
function closeAuth() { body.classList.remove("auth-open"); }

function openAdmin() { body.classList.add("admin-open"); }
function closeAdmin() { body.classList.remove("admin-open"); }

function openDeleteConfirm(message, onConfirm) {
  const text = document.getElementById("deleteConfirmText");
  if (text) text.textContent = message;
  pendingDeleteAction = onConfirm;
  body.classList.add("delete-confirm-open");
}

function closeDeleteConfirm() {
  body.classList.remove("delete-confirm-open");
  pendingDeleteAction = null;
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast-notification ${type}`;
  
  const icon = type === "success" ? "✅" : "⚠️";
  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = "fadeOutToast 0.3s ease forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// --- INIT ---

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  updateDate();
  renderFilterChips();
  renderComposerCategories("main", ZONE_CONFIG.main.categories[0]);
  updateUserBadge();
  updateAdminUI();

  /* ===== HAMBURGER MENU (accessibility) ===== */
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  if (hamburger && navMenu) {
    hamburger.setAttribute("aria-label", "Mở menu điều hướng");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("role", "button");
    hamburger.setAttribute("tabindex", "0");
    hamburger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hamburger.click(); }
    });
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", hamburger.classList.contains("active") ? "true" : "false");
    });
    navMenu.setAttribute("role", "menubar");
    navMenu.querySelectorAll(".nav-link").forEach(link => {
      link.setAttribute("role", "menuitem");
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
    navMenu.querySelectorAll(".nav-link.active").forEach(l => l.setAttribute("aria-current", "page"));
  }

  // Initial Load
  fetchThreads();

  const threadForm = document.getElementById("threadForm");
  const feedZoneGroup = document.getElementById("feedZoneGroup");
  const filterCategoryGroup = document.getElementById("filterCategoryGroup");
  const threadZoneGroup = document.getElementById("threadZoneGroup");
  const threadZoneInput = document.getElementById("threadZone");
  const threadCategoryGroup = document.getElementById("threadCategoryGroup");
  const threadCategoryInput = document.getElementById("threadCategory");
  const threadList = document.getElementById("threadList");
  
  // Modal & Toggle Elements
  const composerToggle = document.getElementById("composerToggle");
  const composerClose = document.getElementById("composerClose");
  const composerMinimize = document.getElementById("composerMinimize");
  const composerBackdrop = document.getElementById("composerBackdrop");
  const authToggle = document.getElementById("authToggle");
  const authModal = document.getElementById("authModal");
  const authClose = document.getElementById("authClose");
  const authSave = document.getElementById("authSave");
  const authUsername = document.getElementById("authUsername");
  const authAnonymousDefault = document.getElementById("authAnonymousDefault");
  const adminToggle = document.getElementById("adminToggle");
  const adminModal = document.getElementById("adminModal");
  const adminClose = document.getElementById("adminClose");
  const adminLogin = document.getElementById("adminLogin");
  const adminPassword = document.getElementById("adminPassword");
  const adminError = document.getElementById("adminError");
  const deleteConfirmModal = document.getElementById("deleteConfirmModal");
  const deleteConfirmCancel = document.getElementById("deleteConfirmCancel");
  const deleteConfirmOk = document.getElementById("deleteConfirmOk");
  const themeToggle = document.getElementById("themeToggle");

  authUsername.value = currentUser.username;
  authAnonymousDefault.checked = currentUser.anonymousDefault;

  // Event Listeners
  themeToggle.addEventListener("click", toggleTheme);

  composerToggle.addEventListener("click", toggleComposer);
  
  // Close: Reset form and close
  composerClose.addEventListener("click", () => {
    threadForm.reset();
    closeComposer();
  });

  // Minimize: Keep form state and close
  composerMinimize.addEventListener("click", () => {
    showToast("Đã lưu nháp!", "success");
    closeComposer();
  });
  
  // Backdrop click also just minimizes/closes without reset (for safety) 
  // or should we make it reset? Let's make it safe (minimize)
  composerBackdrop.addEventListener("click", closeComposer);

  authToggle.addEventListener("click", openAuth);
  authClose.addEventListener("click", closeAuth);
  authModal.addEventListener("click", (e) => {
    if (e.target.id === "authModal") closeAuth();
  });

  adminToggle.addEventListener("click", () => {
    if (isAdmin) {
      isAdmin = false;
      saveAdminState(false);
      updateAdminUI();
      renderThreads(); // Re-render to hide delete buttons
      return;
    }
    adminError.textContent = "";
    adminPassword.value = "";
    openAdmin();
  });

  adminClose.addEventListener("click", closeAdmin);
  adminModal.addEventListener("click", (e) => {
    if (e.target.id === "adminModal") closeAdmin();
  });

  deleteConfirmCancel.addEventListener("click", closeDeleteConfirm);
  deleteConfirmModal.addEventListener("click", (e) => {
    if (e.target.id === "deleteConfirmModal") closeDeleteConfirm();
  });
  deleteConfirmOk.addEventListener("click", () => {
    if (typeof pendingDeleteAction === "function") {
      pendingDeleteAction();
    }
    closeDeleteConfirm();
  });

  adminLogin.addEventListener("click", () => {
    if (adminPassword.value !== ADMIN_PASSWORD) {
      adminError.textContent = "Sai mật khẩu admin.";
      return;
    }
    isAdmin = true;
    saveAdminState(true);
    updateAdminUI();
    renderThreads(); // Re-render to show delete buttons
    closeAdmin();
  });

  authSave.addEventListener("click", () => {
    currentUser = {
      username: authUsername.value.trim(),
      anonymousDefault: authAnonymousDefault.checked
    };
    saveUserProfile(currentUser);
    updateUserBadge();
    renderThreads(); // Re-render to update comment names
    closeAuth();
  });

  // Enter key for Admin Login
  adminPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") adminLogin.click();
  });

  // Enter key for User Profile
  authUsername.addEventListener("keydown", (e) => {
    if (e.key === "Enter") authSave.click();
  });

  feedZoneGroup.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-zone]");
    if (!chip) return;
    activeZone = chip.getAttribute("data-zone");
    activeFilter = "all";
    setActiveChip(feedZoneGroup, "data-zone", activeZone);
    renderFilterChips();
    fetchThreads(); // Fetch new zone data
  });

  filterCategoryGroup.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-filter]");
    if (!chip) return;
    activeFilter = chip.getAttribute("data-filter");
    setActiveChip(filterCategoryGroup, "data-filter", activeFilter);
    renderThreads(); // Filter locally
  });

  threadZoneGroup.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-zone]");
    if (!chip) return;
    const zone = chip.getAttribute("data-zone");
    threadZoneInput.value = zone;
    setActiveChip(threadZoneGroup, "data-zone", zone);
    renderComposerCategories(zone, ZONE_CONFIG[zone].categories[0]);
  });

  threadCategoryGroup.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-category]");
    if (!chip) return;
    const category = chip.getAttribute("data-category");
    threadCategoryInput.value = category;
    setActiveChip(threadCategoryGroup, "data-category", category);
  });

  threadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("threadTitle").value.trim();
    const zone = threadZoneInput.value;
    const category = threadCategoryInput.value;
    const content = document.getElementById("threadContent").value.trim();

    if (!title || !content) return;
    addThread(title, zone, category, content);
    threadForm.reset();
    threadZoneInput.value = "main";
    setActiveChip(threadZoneGroup, "data-zone", "main");
    renderComposerCategories("main", ZONE_CONFIG.main.categories[0]);
    closeComposer();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  threadList.addEventListener("click", (e) => {
    const likeId = e.target.getAttribute("data-like");
    if (likeId) {
      likeThread(likeId);
      return;
    }

    const toggleCommentId = e.target.getAttribute("data-toggle-comments");
    if (toggleCommentId) {
      expandedThreadId = expandedThreadId === toggleCommentId ? null : toggleCommentId;
      renderThreads();
      return;
    }

    const toggleReportId = e.target.getAttribute("data-toggle-report");
    if (toggleReportId) {
      // Toggle report separately
      openReportId = openReportId === toggleReportId ? null : toggleReportId;
      renderThreads();
      
      // Auto-focus input if opening
      if (openReportId) {
        setTimeout(() => {
          const reportInput = threadList.querySelector(`[data-report-form="${toggleReportId}"] .report-input`);
          if (reportInput) reportInput.focus();
        }, 50);
      }
      return;
    }

    const deleteThreadId = e.target.getAttribute("data-delete-thread");
    if (deleteThreadId && isAdmin) {
      openDeleteConfirm("Bạn có chắc muốn xóa bài viết này không?", () => {
        deleteThread(deleteThreadId);
      });
      return;
    }

    const deleteCommentRef = e.target.getAttribute("data-delete-comment");
    if (deleteCommentRef && isAdmin) {
      const [threadId, commentId] = deleteCommentRef.split(":");
      if (commentId) {
        openDeleteConfirm("Bạn có chắc muốn xóa bình luận này không?", () => {
          deleteComment(threadId, commentId);
        });
      }
    }
  });

  threadList.addEventListener("submit", (e) => {
    const commentForm = e.target.closest("[data-comment-form]");
    if (commentForm) {
      e.preventDefault();
      const threadId = commentForm.getAttribute("data-comment-form");
      const input = commentForm.querySelector(".comment-input");
      const anonymousCheck = commentForm.querySelector(".comment-anon-check");
      const text = input.value.trim();
      if (!text) return;
      addComment(threadId, text, getDisplayName(), anonymousCheck.checked);
      expandedThreadId = threadId;
      return;
    }

    const reportForm = e.target.closest("[data-report-form]");
    if (reportForm) {
      e.preventDefault();
      const threadId = reportForm.getAttribute("data-report-form");
      const reasonInput = reportForm.querySelector(".report-input");
      const reason = reasonInput.value.trim();
      if (!reason) return;

      submitReport(threadId, reason, "", getDisplayName());
      showToast("Đã gửi báo cáo thành công. Cảm ơn bạn!");
      reportForm.reset();
      
      // Close report form and refresh view
      openReportId = null;
      renderThreads();
    }
  });

  // Handle Enter key for textareas (Comment & Report)
  threadList.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const target = e.target;
      if (target.classList.contains("comment-input") || target.classList.contains("report-input")) {
        e.preventDefault();
        // Request submit on the parent form
        const form = target.form;
        if (form) form.requestSubmit();
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeComposer();
      closeAuth();
      closeAdmin();
      closeDeleteConfirm();
    }
  });

  /* ===== EASTER EGG (Konami Code) ===== */
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let konamiIdx = 0;
  document.addEventListener("keydown", (e) => {
    konamiIdx = (e.key === KONAMI[konamiIdx]) ? konamiIdx + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (konamiIdx === KONAMI.length) { konamiIdx = 0; _showEasterEgg(); }
  });
  function _showEasterEgg() {
    const existing = document.getElementById("easterEggPopup");
    if (existing) existing.remove();
    const popup = document.createElement("div");
    popup.id = "easterEggPopup";
    popup.className = "easter-egg-popup";
    popup.innerHTML = `<div class="egg-inner"><div class="egg-emoji">🥚✨</div><h2>Bạn tìm ra Easter Egg!</h2><p>Chúc mừng! Bạn đã nhập Konami Code thành công.</p><p style="font-size:1.5rem">🎮🎉🚀🌟💻</p><p><em>↑↑↓↓←→←→BA — Bright Ways secret unlocked!</em></p><button onclick="document.getElementById('easterEggPopup').remove()">Đóng</button></div>`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 8000);
  }
});

