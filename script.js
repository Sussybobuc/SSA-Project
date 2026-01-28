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

    window.location.href = "quiz.html?subject=" + subject;
  }


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

  //Change title based on subject chosen from Index.html/Question.html
  const params = new URLSearchParams(window.location.search);
  const subject = params.get("subject") || "it";

  const quizTitle = document.getElementById("quizTitle");
  if(subject === 'SE') quizTitle.innerText = "Quiz Kỹ thuật phần mềm";
  else if(subject === 'AI') quizTitle.innerText = "Quiz Trí tuệ nhân tạo";
  else if(subject === 'DS') quizTitle.innerText = "Quiz Khoa học dữ liệu ứng dụng";
  else if(subject === 'SEC') quizTitle.innerText = "Quiz An toàn thông tin";
  else quizTitle.innerText = "Quiz tìm chuyên ngành hẹp phù hợp (CNTT)";

  // Quiz logic
  const form = document.getElementById("quizForm");
  const resultBox = document.getElementById("resultBox");
  const top1 = document.getElementById("top1");
  const top2 = document.getElementById("top2");
  const explain = document.getElementById("explain");
  const resetBtn = document.getElementById("resetBtn");

  const majors = {
    se: { name: "Kỹ thuật phần mềm (Software Engineering)", score: 0, desc: "Hợp với bạn nếu bạn thích code sản phẩm, làm web/app, teamwork và xây tính năng." },
    ai: { name: "Khoa học dữ liệu / AI (Data Science & AI)", score: 0, desc: "Hợp với bạn nếu bạn thích dữ liệu, mô hình, phân tích, ML và học sâu kiến thức." },
    sec:{ name: "An ninh mạng (Cyber Security)", score: 0, desc: "Hợp với bạn nếu bạn thích bảo mật, kiểm tra lỗ hổng, hệ thống và tư duy phòng thủ." },
    net:{ name: "Mạng máy tính / Cloud (Network & Cloud)", score: 0, desc: "Hợp với bạn nếu bạn thích server, hạ tầng, mạng, Linux và vận hành hệ thống." },
    it: { name: "Hệ thống thông tin (Information Systems)", score: 0, desc: "Hợp với bạn nếu bạn thích phân tích yêu cầu, quy trình, quản lý dữ liệu và kết nối giữa kỹ thuật - người dùng." },
  };

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    const answered = getAnsweredCount();
    if (answered < 15) {
      alert("Bạn chưa trả lời hết câu hỏi. Vui lòng trả lời đủ 15 câu nhé!");
      return;
    }

    resetScores();

    for (let i = 1; i <= 15; i++) {
      const checked = form.querySelector(`input[name="q${i}"]:checked`);
      addPoints(checked.value);
    }

    const sorted = Object.keys(majors)
      .map(k => ({ key: k, ...majors[k] }))
      .sort((a, b) => b.score - a.score);

    const first = sorted[0];
    const second = sorted[1];

    top1.innerHTML = `🥇 <b>Phù hợp nhất:</b> ${first.name} — <b>${first.score}</b> điểm`;
    top2.innerHTML = `🥈 <b>Phù hợp thứ 2:</b> ${second.name} — <b>${second.score}</b> điểm`;

    explain.innerHTML = `
      <div class="card">
        <h3>Vì sao bạn hợp với ${first.name}?</h3>
        <p>${first.desc}</p>
      </div>
      <div class="card">
        <h3>Lựa chọn dự phòng: ${second.name}</h3>
        <p>${second.desc}</p>
      </div>
    `;

    resultBox.classList.remove("hidden");
  });

  resetBtn.addEventListener("click", function() {
    form.reset();
    resultBox.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  //AI chatbot
  async function askCareerAI() {
  const question = document.getElementById("career-question").value;
  const box = document.getElementById("career-answer");

  box.textContent = "AI đang trả lời...";

  const prompt = `
Bạn là cố vấn hướng nghiệp CNTT tại Việt Nam.
Câu hỏi của học sinh:
"${question}"

Hãy trả lời ngắn gọn, dễ hiểu, thực tế. Tất cả câu trả lời đều bằng tiếng Việt.
`;

  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:8b",
        prompt,
        stream: false
      })
    });

    const data = await res.json();
    box.textContent = data.response;

  } catch {
    box.textContent = "Không kết nối được AI.";
  }
}
const music = document.getElementById("bgMusic");

function startMusicOnce() {
  music.play().catch(() => {});
  document.removeEventListener("click", startMusicOnce);
}

// Chạy nhạc khi user click lần đầu
document.addEventListener("click", startMusicOnce);

