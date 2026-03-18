//Scripts

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

  /* ===== NAV DATE ===== */
  function updateNavDate() {
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
  updateNavDate();
  setInterval(updateNavDate, 60000);

  /* ===== DARK MODE PERSISTENCE ===== */
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  if (!document.getElementById("themeToggle")) {
    const btn = document.createElement("button");
    btn.id = "themeToggle";
    btn.className = "theme-btn";
    btn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    btn.onclick = () => {
      document.body.classList.toggle("dark");
      if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        btn.textContent = "☀️";
      } else {
        localStorage.setItem("theme", "light");
        btn.textContent = "🌙";
      }
    };
    document.body.appendChild(btn);
  }

  /* ===== EASTER EGG (Konami Code) ===== */
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let konamiIdx = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        showEasterEgg();
      }
    } else {
      konamiIdx = e.key === KONAMI[0] ? 1 : 0;
    }
  });

  function showEasterEgg() {
    const existing = document.getElementById("easterEggPopup");
    if (existing) existing.remove();
    const popup = document.createElement("div");
    popup.id = "easterEggPopup";
    popup.className = "easter-egg-popup";
    popup.innerHTML = `
      <div class="egg-inner">
        <div class="egg-emoji">🥚✨</div>
        <h2>Bạn tìm ra Easter Egg!</h2>
        <p>Chúc mừng! Bạn đã nhập Konami Code thành công.</p>
        <p style="font-size:1.5rem">🎮🎉🚀🌟💻</p>
        <p><em>↑↑↓↓←→←→BA — Bright Ways secret unlocked!</em></p>
        <button onclick="document.getElementById('easterEggPopup').remove()">Đóng</button>
      </div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 8000);
  }
});

//Handles startup UI initialization and background music setup
window.addEventListener("DOMContentLoaded", () => {
  const startup = document.getElementById("startup");
  const logo = document.querySelector(".logo");
  const music = document.getElementById("bgMusic");
  const btn = document.getElementById("musicToggle");

  const MUSIC_KEY = "bg_music_state";
  music.volume = 1;

  /* ===== SPLASH LOGO ===== */
  startup.classList.add("show");

  setTimeout(() => {
    logo.classList.add("stop");
    startup.classList.add("hide");

    setTimeout(() => {
      startup.remove();
      startup.style.transform = "none";

      /* ===== TỰ CHẠY NHẠC SAU SPLASH ===== */
      const state = localStorage.getItem(MUSIC_KEY);
      if (state !== "pause") {
        music.play().catch(() => {
          document.addEventListener(
            "click",
            () => music.play(),
            { once: true }
          );
        });
        btn.textContent = "🔊";
        localStorage.setItem(MUSIC_KEY, "play");
      } else {
        btn.textContent = "🔇";
      }

    }, 800);
  }, 1500);
});

/* ===== NÚT BẬT / TẮT ===== */
function toggleMusic() {
  const music = document.getElementById("bgMusic");
  const btn = document.getElementById("musicToggle");
  const MUSIC_KEY = "bg_music_state";

  if (music.paused) {
    music.play();
    btn.textContent = "🔊";
    localStorage.setItem(MUSIC_KEY, "play");
    btn.classList.remove("muted");
  } else {
    music.pause();
    btn.textContent = "🔇";
    localStorage.setItem(MUSIC_KEY, "pause");
    btn.classList.add("muted");
  }
}

//redirect đến cùng một trang question nhưng sẽ có value riêng
function goQuestion(subject){
    window.location.href = "question.html?subject=" + subject;
  }

function showToast() {
  const toast = document.getElementById("toast");
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

// redirect đến trang quiz.html theo ngành
  function startQuiz(){
    const params = new URLSearchParams(window.location.search);
    const subject = params.get("subject");

    window.location.href = "Quiz section/quiz.html?subject=" + subject;
  }

  const majors = (typeof window !== "undefined" && window.majors) ? window.majors : {};
  function resetScores() {
    Object.keys(majors).forEach(k => majors[k].score = 0);
  }

  function addPoints(value) {
    const keys = value.split(",").map(s => s.trim()).filter(Boolean);
    keys.forEach(k => {
      if (majors[k]) majors[k].score += 1;
    });
  }

// ===== NHẠC NỀN TỰ ĐỘNG =====
const music = document.getElementById("bgMusic");

function startMusicOnce() {
  if (music) music.play().catch(() => {});
  document.removeEventListener("click", startMusicOnce);
}

// Chạy nhạc khi user click lần đầu (chỉ trên trang có bgMusic)
if (music) {
  document.addEventListener("click", startMusicOnce);
}

