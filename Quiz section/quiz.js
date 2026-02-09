// Quiz Logic for Quiz System

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
  const total = 20;
  let answered = 0;
  for (let i = 1; i <= total; i++) {
    const checked = form.querySelectorAll(`input[name="q${i}"]:checked`);
    if (checked.length > 0) answered++;
  }
  return answered;
}

//Change title based on subject chosen from Index.html/Question.html
const params = new URLSearchParams(window.location.search);
const subject = params.get("subject") || "CNTT";

const quizTitle = document.getElementById("quizTitle");
if(subject === 'SE') quizTitle.innerText = "Quiz Kỹ thuật phần mềm";
else if(subject === 'AI') quizTitle.innerText = "Quiz Trí tuệ nhân tạo";
else if(subject === 'SEC') quizTitle.innerText = "Quiz An toàn thông tin";
else if(subject === 'VM') quizTitle.innerText = "Quiz Vi mạch bán dẫn";
else if(subject === 'CNGT') quizTitle.innerText = "Quiz Công nghệ ô tô số";
else if(subject === 'HTTT') quizTitle.innerText = "Quiz Hệ thống thông tin";
else if(subject === 'GD') quizTitle.innerText = "Quiz Thiết kế đồ hoạ & mỹ thuật số";
else quizTitle.innerText = "Quiz tìm chuyên ngành hẹp phù hợp (CNTT)";

// Show/Hide correct quiz set based on subject
const allQuizSets = document.querySelectorAll('.quiz-set');
allQuizSets.forEach(set => {
  const quizSubject = set.getAttribute('data-subject');
  if (quizSubject === subject) {
    set.style.display = 'block';
  } else {
    set.style.display = 'none';
  }
});

// Quiz logic
const form = document.getElementById("quizForm");
const resultBox = document.getElementById("resultBox");
const top1 = document.getElementById("top1");
const top2 = document.getElementById("top2");
const explain = document.getElementById("explain");
const resetBtn = document.getElementById("resetBtn");
const stickyWrap = document.querySelector(".sticky-wrapper");

// Different majors for different quiz types
const majorsByCNTT = {
  placeholder1: { name: ":3 1", score: 0, desc: "Con quỷ có thể khóc" },
  placeholder2: { name: ":3 2", score: 0, desc: "Tâm trí = Bị kiểm soát" },
  placeholder3:{ name: ":3 3", score: 0, desc: "Vì cái vibes" },
  placeholder4:{ name: ":3 4", score: 0, desc: "Tra vít code" },
  placeholder5: { name: ":3 5", score: 0, desc: "Hitler bé nhỏ" },
};

const majorsBySE = {
  JBE: { name: "Japanese Bridge Engineer", score: 0, desc: "Bạn phù hợp với vai trò cầu nối IT giữa Việt Nam và Nhật Bản, kết hợp kỹ năng kỹ thuật với khả năng giao tiếp tiếng Nhật chuyên nghiệp." },
  AI: { name: "AI / Machine Learning", score: 0, desc: "Bạn phù hợp với nghiên cứu và phát triển các mô hình trí tuệ nhân tạo, học máy, xử lý dữ liệu và giải quyết bài toán phức tạp." },
  ReactNode: { name: "React/NodeJS Developer", score: 0, desc: "Bạn phù hợp với phát triển web hiện đại, xây dựng giao diện người dùng với React và backend với NodeJS." },
  IC: { name: "IC Design (Vi mạch bán dẫn)", score: 0, desc: "Bạn phù hợp với thiết kế vi mạch, làm việc với phần cứng, mạch điện tử và hệ thống nhúng." },
  Java: { name: "Intensive Java Developer", score: 0, desc: "Bạn phù hợp với phát triển hệ thống doanh nghiệp lớn bằng Java, Spring framework và kiến trúc microservices." },
  DevSecOps: { name: "DevSecOps for Cloud", score: 0, desc: "Bạn phù hợp với vận hành hệ thống cloud, tự động hóa deployment, và đảm bảo bảo mật cho hạ tầng." },
  GameDev: { name: "Game Development", score: 0, desc: "Bạn phù hợp với phát triển game, thiết kế gameplay, đồ họa và tạo trải nghiệm giải trí cho người chơi." },
  DataSci: { name: "Applied Data Science", score: 0, desc: "Bạn phù hợp với phân tích dữ liệu, xử lý dữ liệu lớn, trực quan hóa và biến dữ liệu thành insight có giá trị." },
  DotNet: { name: ".NET Programming", score: 0, desc: "Bạn phù hợp với phát triển ứng dụng đa nền tảng bằng .NET framework, C# và các công nghệ Microsoft." },
};

// Select correct majors based on subject
let majors;
switch(subject) {
  case 'SE':
    majors = majorsBySE;
    break;
  case 'AI':
    majors = majorsByAI;
    break;
  case 'SEC':
    majors = majorsBySEC;
    break;
  default:
    majors = majorsByCNTT;
}

form.addEventListener("submit", function(e) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
  const answered = getAnsweredCount();
  if (answered < 20) {
    alert("Bạn chưa trả lời hết câu hỏi. Vui lòng trả lời đủ 20 câu nhé!");
    return;
  }

  resetScores();

  for (let i = 1; i <= 20; i++) {
    const checkedBoxes = form.querySelectorAll(`input[name="q${i}"]:checked`);
    checkedBoxes.forEach(box => addPoints(box.value));
  }

  const sorted = Object.keys(majors)
    .map(k => ({ key: k, ...majors[k] }))
    .sort((a, b) => b.score - a.score);

  const first = sorted[0];
  const second = sorted[1];
  // RESET animation mỗi lần chạy lại quiz
  stickyWrap.classList.add("hidden");
  void stickyWrap.offsetWidth; // ép browser reset animation
  stickyWrap.classList.remove("hidden");
  resultBox.classList.add("hidden");
  void resultBox.offsetWidth; // ép browser reset animation
  resultBox.classList.remove("hidden");
  top1.innerHTML = `
  <span class="reveal delay-1">🥇 <b>Phù hợp nhất:</b> ${first.name} — <b>${first.score}</b> điểm</span>`;
  top2.innerHTML = `<span class="reveal delay-2">🥈 <b>Phù hợp thứ 2:</b> ${second.name} — <b>${second.score}</b> điểm</span>`;

  explain.innerHTML = `
    <div class="card reveal delay-3">
      <h3>Vì sao bạn hợp với ${first.name}?</h3>
      <p>${first.desc}</p>
    </div>
    <div class="card reveal delay-3">
      <h3>Lựa chọn dự phòng: ${second.name}</h3>
      <p>${second.desc}</p>
    </div>
  `;
  stickyWrap.classList.remove("hidden");
  resultBox.classList.remove("hidden");
});

resetBtn.addEventListener("click", function() {
  form.reset();
  stickyWrap.classList.add("hidden");
  resultBox.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Giới hạn số đáp án được chọn cho mỗi câu hỏi
form.addEventListener("change", function(e) {
  if (e.target.type === "checkbox") {
    const questionName = e.target.name;
    
    // Find the parent qbox element to read max-selections setting
    const qboxElement = e.target.closest('.qbox');
    const maxSelections = qboxElement ? parseInt(qboxElement.dataset.maxSelections || "1") : 1;
    
    const checkedBoxes = form.querySelectorAll(`input[name="${questionName}"]:checked`);
    
    if (checkedBoxes.length > maxSelections) {
      e.target.checked = false;
      alert(`Bạn chỉ được chọn tối đa ${maxSelections} đáp án cho câu hỏi này!`);
    }
  }
});

// ===== NHẠC NỀN TỰ ĐỘNG =====
const music = document.getElementById("bgMusic");

function startMusicOnce() {
  music.play().catch(() => {});
  document.removeEventListener("click", startMusicOnce);
}

// Chạy nhạc khi user click lần đầu
document.addEventListener("click", startMusicOnce);

// NÚT BẬT / TẮT NHẠC
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


