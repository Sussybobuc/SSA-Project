// Quiz Logic for Quiz System

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
});

/* ===== TOAST NOTIFICATION ===== */
function showQuizToast(message) {
  const toast = document.getElementById("quizToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("active");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("active"), 3000);
}

/* ===== PROGRESS COUNTER ===== */
function updateProgress() {
  const el = document.getElementById("quizProgress");
  if (!el) return;
  const answered = getAnsweredCount();
  el.textContent = `${answered} / 20 câu đã trả lời`;
  el.className = "quiz-progress" + (answered === 20 ? " complete" : "");
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

function getActiveQuizSet() {
  return document.querySelector(`.quiz-set[data-subject="${subject}"]`);
}

function getAnsweredCount() {
  const total = 20;
  let answered = 0;
  const activeSet = getActiveQuizSet();
  if (!activeSet) return 0;
  for (let i = 1; i <= total; i++) {
    const checked = activeSet.querySelectorAll(`input[name="q${i}"]:checked`);
    if (checked.length > 0) answered++;
  }
  return answered;
}

function getFirstUnansweredQbox() {
  const activeSet = getActiveQuizSet();
  if (!activeSet) return null;
  for (let i = 1; i <= 20; i++) {
    const checked = activeSet.querySelectorAll(`input[name="q${i}"]:checked`);
    if (checked.length === 0) {
      const input = activeSet.querySelector(`input[name="q${i}"]`);
      return input ? input.closest('.qbox') : null;
    }
  }
  return null;
}

//Change title based on subject chosen from Index.html/Question.html
const params = new URLSearchParams(window.location.search);
const subject = params.get("subject") || "CNTT";

const quizTitle = document.getElementById("quizTitle");
if(subject === 'SE') quizTitle.innerText = "Quiz Kỹ thuật phần mềm";
else if(subject === 'AI') quizTitle.innerText = "Quiz Trí tuệ nhân tạo";
else if(subject === 'IA') quizTitle.innerText = "Quiz An toàn thông tin";
else if(subject === 'IC') quizTitle.innerText = "Quiz Vi mạch bán dẫn";
else if(subject === 'AS') quizTitle.innerText = "Quiz Công nghệ ô tô số";
else if(subject === 'IS') quizTitle.innerText = "Quiz Hệ thống thông tin";
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
  se: { name: "Kỹ thuật phần mềm (Software Engineering)", score: 0, desc: "Hợp với bạn nếu bạn thích code sản phẩm, làm web/app, teamwork và xây tính năng." },
  ai: { name: "Khoa học dữ liệu / AI (Data Science & AI)", score: 0, desc: "Hợp với bạn nếu bạn thích dữ liệu, mô hình, phân tích, ML và học sâu kiến thức." },
  sec:{ name: "An ninh mạng (Cyber Security)", score: 0, desc: "Hợp với bạn nếu bạn thích bảo mật, kiểm tra lỗ hổng, hệ thống và tư duy phòng thủ." },
  net:{ name: "Mạng máy tính / Cloud (Network & Cloud)", score: 0, desc: "Bạn phù hợp với bạn nếu bạn thích server, hạ tầng, mạng, Linux và vận hành hệ thống." },
  it: { name: "Hệ thống thông tin (Information Systems)", score: 0, desc: "Hợp với bạn nếu bạn thích phân tích yêu cầu, quy trình, quản lý dữ liệu và kết nối giữa kỹ thuật - người dùng." },
};
// MAJORS OBJECT 
// SE VALUE
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
// AI VALUE
const majorsByAI = {
  DS: {
    name: "Applied Data Science",
    score: 0,
    desc: "Bạn phù hợp với việc phân tích dữ liệu thực tế, khai phá dữ liệu lớn và biến dữ liệu thành thông tin có giá trị phục vụ quyết định."
  },

  AIApp: {
    name: "AI Application",
    score: 0,
    desc: "Bạn phù hợp với việc áp dụng trí tuệ nhân tạo vào các lĩnh vực cụ thể như y tế, tài chính, nghiên cứu khoa học và các bài toán đời sống."
  },

  AIRes: {
    name: "AI Applied Research",
    score: 0,
    desc: "Bạn phù hợp với hướng nghiên cứu thuật toán AI, xử lý ngôn ngữ, tiếng nói, hình ảnh và phát triển các hệ thống thông minh."
  }
};
// GD VALUE
const majorsByGD = {
  Anim2D: {
    name: "2D Animation",
    score: 0,
    desc: "Bạn phù hợp với việc kể chuyện bằng hình ảnh và chuyển động phẳng, tập trung vào biểu cảm, nhịp điệu và phong cách minh họa."
  },
  Anim3D: {
    name: "3D Animation",
    score: 0,
    desc: "Bạn phù hợp với xây dựng nhân vật và chuyển động trong không gian ba chiều, làm việc với mô hình, ánh sáng và vật liệu."
  },
  Interactive: {
    name: "Interactive Design (UI/UX)",
    score: 0,
    desc: "Bạn phù hợp với thiết kế trải nghiệm người dùng, giao diện ứng dụng và tối ưu cách người dùng tương tác với sản phẩm số."
  },
  Communication: {
    name: "Communication Design",
    score: 0,
    desc: "Bạn phù hợp với truyền tải thông điệp qua hình ảnh như nhận diện thương hiệu, ấn phẩm, bao bì và thiết kế sự kiện."
  },
  DigitalAnim: {
    name: "Digital Animation",
    score: 0,
    desc: "Bạn phù hợp với sáng tạo hoạt hình kỹ thuật số linh hoạt, kết hợp nhiều kỹ thuật 2D và 3D để tạo sản phẩm sinh động."
  },
  Multimedia: {
    name: "Multimedia Communication Design",
    score: 0,
    desc: "Bạn phù hợp với thiết kế đa nền tảng, kết hợp hình ảnh, chuyển động và tương tác để tạo trải nghiệm truyền thông hoàn chỉnh."
  }
};
// IC VALUE
const majorsByIC = {
  Robotics: {
    name: "Robotics",
    score: 0,
    desc: "Bạn phù hợp với phát triển robot tự động, robot cộng tác và các hệ thống có khả năng tương tác với môi trường thực."
  },
  IoT: {
    name: "Internet of Things (IoT)",
    score: 0,
    desc: "Bạn phù hợp với xây dựng hệ thống thiết bị kết nối, phần mềm nhúng và các nền tảng thông minh liên kết nhiều phần cứng."
  },
  PackagingTesting: {
    name: "IC Packaging & Testing",
    score: 0,
    desc: "Bạn phù hợp với đảm bảo chất lượng vi mạch, kiểm thử, thẩm định và quy trình sản xuất công nghiệp."
  },
  ICOptimization: {
    name: "IC Design Optimization",
    score: 0,
    desc: "Bạn phù hợp với mô phỏng, phân tích và tối ưu thiết kế mạch tích hợp để đạt hiệu năng và hiệu quả cao."
  }
};
// AS VALUE
const majorsByAS = {
  AUTOSAR: {
    name: "Automotive Software Architecture (AUTOSAR)",
    score: 0,
    desc: "Bạn phù hợp với phát triển kiến trúc phần mềm ô tô, đảm bảo an toàn chức năng, độ ổn định và tuân thủ tiêu chuẩn hệ thống."
  },
  IVI: {
    name: "In-Vehicle Infotainment (IVI)",
    score: 0,
    desc: "Bạn phù hợp với phát triển hệ thống giải trí và trải nghiệm người dùng trên ô tô, làm việc với Android/Linux và giao diện tương tác."
  },
  SelfDriving: {
    name: "Self-Driving Car Engineering",
    score: 0,
    desc: "Bạn phù hợp với phát triển xe tự hành, xử lý nhận thức môi trường, điều khiển và tích hợp hệ thống thông minh."
  }
};
// IA VALUE
const majorsByIA = {
  AppSec: {
    name: "Application Security",
    score: 0,
    desc: "Bạn phù hợp với thiết kế và phát triển phần mềm an toàn ngay từ đầu, tích hợp bảo mật vào vòng đời phát triển."
  },
  SysSec: {
    name: "System & Network Security",
    score: 0,
    desc: "Bạn phù hợp với vận hành, giám sát, điều tra và ứng phó sự cố trong hệ thống và mạng thực tế."
  },
  AISec: {
    name: "AI for Cyber Security",
    score: 0,
    desc: "Bạn phù hợp với phân tích dữ liệu an ninh và xây dựng hệ thống phát hiện tấn công thông minh bằng AI."
  }
};
// IS VALUE
const majorsByIS = {
  EnterpriseIS: {
    name: "Enterprise Information System",
    score: 0,
    desc: "Bạn phù hợp với phân tích nghiệp vụ, quản lý quy trình và hỗ trợ ra quyết định trong tổ chức."
  },
  SAP: {
    name: "SAP / ERP Systems",
    score: 0,
    desc: "Bạn phù hợp với triển khai và vận hành hệ thống quản trị doanh nghiệp tích hợp quy mô lớn."
  },
  SoftwareQuality: {
    name: "Software System Quality",
    score: 0,
    desc: "Bạn phù hợp với kiểm thử, đảm bảo chất lượng và cải thiện độ tin cậy của hệ thống phần mềm."
  },
  ISSecurity: {
    name: "Cybersecurity for Information Systems",
    score: 0,
    desc: "Bạn phù hợp với bảo vệ hệ thống thông tin và quản lý rủi ro an toàn trong tổ chức."
  },
  ISDataScience: {
    name: "Applied Data Science in IS",
    score: 0,
    desc: "Bạn phù hợp với phân tích dữ liệu doanh nghiệp và hỗ trợ ra quyết định dựa trên dữ liệu."
  }
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
  case 'IA':
    majors = majorsByIA;
    break;
  case 'IC':
    majors = majorsByIC;
    break;
  case 'AS':
    majors = majorsByAS;
    break;
  case 'GD':
    majors = majorsByGD;
    break;
  case 'IS':
    majors = majorsByIS;
    break;
  default:
    majors = majorsByCNTT;
    break;
}

form.addEventListener("submit", function(e) {
  e.preventDefault();
  const answered = getAnsweredCount();
  if (answered < 20) {
    const firstUnanswered = getFirstUnansweredQbox();
    if (firstUnanswered) {
      firstUnanswered.scrollIntoView({ behavior: "smooth", block: "center" });
      firstUnanswered.classList.add("unanswered-highlight");
      setTimeout(() => firstUnanswered.classList.remove("unanswered-highlight"), 1500);
    }
    showQuizToast("⚠️ Bạn chưa trả lời hết câu hỏi. Vui lòng trả lời đủ 20 câu nhé!");
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });

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
    
    // Only count checked boxes within the active quiz-set
    const activeSet = getActiveQuizSet();
    const checkedBoxes = activeSet
      ? activeSet.querySelectorAll(`input[name="${questionName}"]:checked`)
      : form.querySelectorAll(`input[name="${questionName}"]:checked`);
    
    if (checkedBoxes.length > maxSelections) {
      e.target.checked = false;
      showQuizToast(`⚠️ Bạn chỉ được chọn tối đa ${maxSelections} đáp án cho câu hỏi này!`);
    }
  }
  updateProgress();
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


