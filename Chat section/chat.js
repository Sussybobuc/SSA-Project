/* ===== HAMBURGER MENU ===== */
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Close menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }
});

function typeText(element, text, speed = 20) {
  element.textContent = "";
  let i = 0;

  function typing() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      element.scrollIntoView({ behavior: "smooth", block: "end" });
      setTimeout(typing, speed);
    }
  }

  typing();
}
// ===== DARK MODE =====
const themeToggle = document.getElementById("themeToggle");

// Load trạng thái đã lưu
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️";
  } else {
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙";
  }
};
// ===== CHATBOT =====

async function askCareerAI() {
  const input = document.getElementById("career-question");
  const chat = document.getElementById("chatBody");

  const question = input.value.trim();
  if (!question) return;

  // USER MESSAGE
  addMessage(question, "user");
  input.value = "";

  // AI MESSAGE BOX
  const aiBox = addMessage("AI đang trả lời...", "ai");

  const prompt = `
Bạn là cố vấn hướng nghiệp CNTT.
Câu hỏi của sinh viên:
"${question}"

Hãy trả lời ngắn gọn, dễ hiểu, thực tế. Tất cả câu trả lời đều bằng tiếng Việt.
`;

  try {
    //const res = await fetch("http://localhost:11434/api/generate", {
    const res = await fetch("/chat", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question 
      })
    });

    const data = await res.json();

    // ✨ GÕ CHỮ DẦN
    typeText(aiBox, data.reply, 18);
    saveChatHistory(question, data.reply);
    renderHistoryBox();

  } catch {
    aiBox.textContent = "❌ Không kết nối được AI.";
  }
}
function addMessage(text, type) {
  const chat = document.getElementById("chatBody");

  const msg = document.createElement("div");
  msg.className = `msg ${type}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  msg.appendChild(bubble);
  chat.appendChild(msg);

  chat.scrollTop = chat.scrollHeight;

  return bubble; // 👉 để typing effect dùng
}
// ===== LỊCH SỬ CHAT =====
function saveChatHistory(question, answer) {
  const history = JSON.parse(localStorage.getItem("careerAI_history")) || [];

  history.push({
    question,
    answer,
    time: new Date().toLocaleString("vi-VN")
  });

  // Giới hạn 10 lượt chat gần nhất
  if (history.length > 10) history.shift();

  localStorage.setItem("careerAI_history", JSON.stringify(history));
  renderHistoryBox();
}

function renderHistoryBox() {
  const list = document.getElementById("aiHistoryList");
  if (!list) return;

  list.innerHTML = "";

  const history = JSON.parse(localStorage.getItem("careerAI_history")) || [];

  history.slice().reverse().forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "history-item";

    const text = document.createElement("span");
    text.textContent =
      item.question.length > 40
        ? item.question.slice(0, 40) + "..."
        : item.question;

    text.onclick = () => {
      const chatBody = document.getElementById("chatBody");
      chatBody.innerHTML = "";
      addMessage(item.question, "user");
      addMessage(item.answer, "ai");
    };

    const del = document.createElement("span");
    del.className = "delete-btn";
    del.innerHTML = "🗑️";
    del.onclick = (e) => {
      e.stopPropagation();
      removeHistory(index, li);
    };

    li.appendChild(text);
    li.appendChild(del);
    list.appendChild(li);
  });
}
function loadChatHistory() {
  const history = JSON.parse(localStorage.getItem("careerAI_history")) || [];
  const chatBody = document.getElementById("chatBody");
}
// Delete history
function removeHistory(index, element) {
  element.classList.add("fade-out");

  setTimeout(() => {
    let history = JSON.parse(localStorage.getItem("careerAI_history")) || [];
    history.splice(history.length - 1 - index, 1);
    localStorage.setItem("careerAI_history", JSON.stringify(history));
    renderHistoryBox();
  }, 250);
}

function clearHistory() {
  if (!confirm("Xóa toàn bộ lịch sử AI?")) return;

  const list = document.getElementById("aiHistoryList");
  list.classList.add("fade-out");

  setTimeout(() => {
    localStorage.removeItem("careerAI_history");
    renderHistoryBox();
    list.classList.remove("fade-out");
  }, 250);
}
const toggleBtn = document.getElementById("toggleHistory");
const sidebar = document.getElementById("historySidebar");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  toggleBtn.textContent = sidebar.classList.contains("active") ? "✕" : "☰";
});

function openConfirm() {
  document.getElementById("confirmOverlay").classList.add("active");
}

function closeConfirm() {
  document.getElementById("confirmOverlay").classList.remove("active");
}

function confirmClear() {
  localStorage.removeItem("careerAI_history");
  renderHistoryBox(); // render lại sidebar
  closeConfirm();
}


window.addEventListener("DOMContentLoaded", () => {
  loadChatHistory();
  renderHistoryBox();
  document
    .getElementById("sendBtn")
    .addEventListener("click", askCareerAI);
  const input = document.getElementById("career-question");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askCareerAI();
    }
  });
});
