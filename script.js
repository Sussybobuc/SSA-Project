//Scripts

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

  function getAnsweredCount() {
    const total = 15;
    let answered = 0;
    for (let i = 1; i <= total; i++) {
      const checked = form.querySelector(`input[name="q${i}"]:checked`);
      if (checked) answered++;
    }
    return answered;
  }

// ===== NHẠC NỀN TỰ ĐỘNG =====
const music = document.getElementById("bgMusic");

function startMusicOnce() {
  music.play().catch(() => {});
  document.removeEventListener("click", startMusicOnce);
}

// Chạy nhạc khi user click lần đầu
document.addEventListener("click", startMusicOnce);

