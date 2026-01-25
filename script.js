window.addEventListener("DOMContentLoaded", () => {
  const startup = document.getElementById("startup");
  const logo = document.querySelector(".logo");

  const APP_VERSION = "1.01";           // đổi khi có cập nhật lớn
  const VERSION_KEY = "quizai_version";

  // Nếu đã xem splash của version này → bỏ qua
  if (localStorage.getItem(VERSION_KEY) === APP_VERSION) {
    startup.remove();
    return;
  }

  // Ghi nhận version đã xem
  localStorage.setItem(VERSION_KEY, APP_VERSION);

  // Hiện startup từ từ
  startup.classList.add("show");

  // Sau 2s: dừng xoay + về ngang + fade-out
  setTimeout(() => {
    logo.classList.add("stop");
    startup.classList.add("hide");

    // Xóa startup sau khi fade-out
    setTimeout(() => {
      startup.remove();
    }, 1000);

  }, 1500); // thời gian hiển thị logo, 1500s là ổn
});

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

    // Change title based on subject chosen from Web1/Web2
  const params = new URLSearchParams(window.location.search);
  const subject = params.get("subject") || "it";

  const quizTitle = document.getElementById("quizTitle");
  if(subject === "se") quizTitle.innerText = "Quiz Kỹ thuật phần mềm";
  else if(subject === "ai") quizTitle.innerText = "Quiz Trí tuệ nhân tạo";
  else if(subject === "ds") quizTitle.innerText = "Quiz Khoa học dữ liệu ứng dụng";
  else if(subject === "sec") quizTitle.innerText = "Quiz An toàn thông tin";
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