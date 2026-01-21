window.addEventListener("DOMContentLoaded", () => {
  const startup = document.getElementById("startup");
  const logo = document.querySelector(".logo");

  const APP_VERSION = "1.0";           // đổi khi có cập nhật lớn
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


function goNext() {
  location.href = "question.html";
}

function showToast() {
  const toast = document.getElementById("toast");
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}
