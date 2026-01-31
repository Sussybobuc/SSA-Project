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
const subject = params.get("subject") || "CNTT";

const quizTitle = document.getElementById("quizTitle");
if(subject === 'SE') quizTitle.innerText = "Quiz Kỹ thuật phần mềm";
else if(subject === 'AI') quizTitle.innerText = "Quiz Trí tuệ nhân tạo";
else if(subject === 'KHCD') quizTitle.innerText = "Quiz Khoa học dữ liệu ứng dụng";
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

// Different majors for different quiz types
const majorsByCNTT = {
  se: { name: "Kỹ thuật phần mềm (Software Engineering)", score: 0, desc: "Hợp với bạn nếu bạn thích code sản phẩm, làm web/app, teamwork và xây tính năng." },
  ai: { name: "Khoa học dữ liệu / AI (Data Science & AI)", score: 0, desc: "Hợp với bạn nếu bạn thích dữ liệu, mô hình, phân tích, ML và học sâu kiến thức." },
  sec:{ name: "An ninh mạng (Cyber Security)", score: 0, desc: "Hợp với bạn nếu bạn thích bảo mật, kiểm tra lỗ hổng, hệ thống và tư duy phòng thủ." },
  net:{ name: "Mạng máy tính / Cloud (Network & Cloud)", score: 0, desc: "Bạn phù hợp với bạn nếu bạn thích server, hạ tầng, mạng, Linux và vận hành hệ thống." },
  it: { name: "Hệ thống thông tin (Information Systems)", score: 0, desc: "Hợp với bạn nếu bạn thích phân tích yêu cầu, quy trình, quản lý dữ liệu và kết nối giữa kỹ thuật - người dùng." },
};

const majorsBySE = {
  frontend: { name: "Frontend Developer", score: 0, desc: "Bạn phù hợp với việc phát triển giao diện người dùng, làm việc với HTML/CSS/JavaScript, và tạo trải nghiệm người dùng tuyệt vời." },
  backend: { name: "Backend Developer", score: 0, desc: "Bạn phù hợp với việc xây dựng logic server, database, API và xử lý dữ liệu phía sau ứng dụng." },
  fullstack: { name: "Full-stack Developer", score: 0, desc: "Bạn phù hợp với cả frontend và backend, có thể xây dựng ứng dụng hoàn chỉnh từ đầu đến cuối." },
  mobile: { name: "Mobile Developer", score: 0, desc: "Bạn phù hợp với phát triển ứng dụng di động trên iOS/Android hoặc cross-platform." },
  web: { name: "Web Developer", score: 0, desc: "Bạn phù hợp với phát triển website và web applications, làm việc với các công nghệ web hiện đại." },
  devops: { name: "DevOps Engineer", score: 0, desc: "Bạn phù hợp với tự động hóa, CI/CD, container và quản lý infrastructure." },
};

const majorsByAI = {
  cv: { name: "Computer Vision Engineer", score: 0, desc: "Bạn phù hợp với xử lý hình ảnh, video, nhận diện đối tượng và các ứng dụng AI về thị giác máy tính." },
  nlp: { name: "NLP Engineer", score: 0, desc: "Bạn phù hợp với xử lý ngôn ngữ tự nhiên, chatbot, dịch máy và phân tích văn bản." },
  ml: { name: "Machine Learning Engineer", score: 0, desc: "Bạn phù hợp với xây dựng và deploy các mô hình ML, làm việc với dữ liệu và thuật toán học máy." },
  dl: { name: "Deep Learning Specialist", score: 0, desc: "Bạn phù hợp với nghiên cứu và phát triển các mô hình deep learning phức tạp, neural networks." },
  mle: { name: "ML Engineer (General)", score: 0, desc: "Bạn phù hợp với vai trò tổng quát trong machine learning, từ data preprocessing đến model deployment." },
};

const majorsBySEC = {
  offensive: { name: "Offensive Security / Penetration Tester", score: 0, desc: "Bạn phù hợp với việc tìm kiếm lỗ hổng, pentesting, ethical hacking và red team operations." },
  defensive: { name: "Defensive Security / Security Analyst", score: 0, desc: "Bạn phù hợp với việc bảo vệ hệ thống, phát hiện xâm nhập, monitoring và blue team operations." },
  forensics: { name: "Digital Forensics Analyst", score: 0, desc: "Bạn phù hợp với phân tích forensics, incident response và điều tra các vụ tấn công." },
  web: { name: "Web Security Specialist", score: 0, desc: "Bạn phù hợp với bảo mật web application, tìm lỗi OWASP Top 10 và secure coding." },
  pentester: { name: "Penetration Tester", score: 0, desc: "Bạn phù hợp với kiểm tra bảo mật hệ thống, mạng và ứng dụng thông qua các cuộc tấn công có kiểm soát." },
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
  if (answered < 15) {
    alert("Bạn chưa trả lời hết câu hỏi. Vui lòng trả lời đủ 15 câu nhé!");
    return;
  }

  // Show sticky wrapper with results
  const stickyWrapper = document.querySelector('.sticky-wrapper');
  if (stickyWrapper) {
    stickyWrapper.classList.add('visible');
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
  // RESET animation mỗi lần chạy lại quiz
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

  resultBox.classList.remove("hidden");
});

resetBtn.addEventListener("click", function() {
  form.reset();
  resultBox.classList.add("hidden");
  
  // Hide sticky wrapper when reset
  const stickyWrapper = document.querySelector('.sticky-wrapper');
  if (stickyWrapper) {
    stickyWrapper.classList.remove('visible');
  }
  
  window.scrollTo({ top: 0, behavior: "smooth" });
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
