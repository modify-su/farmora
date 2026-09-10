/* ================================================================
   FILE: slide.js
   ────────────────────────────────────────────────────────────────
   แก้ไข / ปรับปรุงจาก version เดิม:
   ✏️  เพิ่ม dot indicators ซิงค์กับ slide ปัจจุบัน
   ✏️  เพิ่ม tab highlights ซิงค์กับ slide
   ✏️  Pause auto-play เมื่อ hover บน slider
   ✏️  เพิ่ม keyboard arrow key support
   ================================================================ */

const slides    = document.querySelectorAll(".slide");
const dots      = document.querySelectorAll(".dot");
const tabs      = document.querySelectorAll(".slider-tab");
const leftArrow  = document.querySelector(".arrow.left");
const rightArrow = document.querySelector(".arrow.right");
const slider     = document.querySelector(".news-slider");

let slideIndex = 0;
let autoPlayTimer = null;

/* ── แสดง slide ตาม index ─────────────────────────────────── */
function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });

  /* ✏️ ใหม่: sync dots */
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });

  /* ✏️ Sync tabs (ถ้ามีแท็บแสดงอยู่) */
  if (tabs && tabs.length > 0) {
    tabs.forEach((tab, i) => {
      tab.classList.toggle("active", i === index);
    });
  }

  slideIndex = index;
}

/* ── เลื่อนหน้า / หลัง ────────────────────────────────────── */
function nextSlide() {
  showSlide((slideIndex + 1) % slides.length);
}

function prevSlide() {
  showSlide((slideIndex - 1 + slides.length) % slides.length);
}

/* ── Auto-play ────────────────────────────────────────────── */
function startAutoPlay() {
  autoPlayTimer = setInterval(nextSlide, 5000);
}

function stopAutoPlay() {
  clearInterval(autoPlayTimer);
}

/* ── Events ───────────────────────────────────────────────── */
if (leftArrow) leftArrow.addEventListener("click", () => { stopAutoPlay(); prevSlide(); startAutoPlay(); });
if (rightArrow) rightArrow.addEventListener("click", () => { stopAutoPlay(); nextSlide(); startAutoPlay(); });

/* ✏️ Dot click */
if (dots && dots.length > 0) {
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => { stopAutoPlay(); showSlide(i); startAutoPlay(); });
  });
}

/* ✏️ Tab click (ถ้ามี) */
if (tabs && tabs.length > 0) {
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => { stopAutoPlay(); showSlide(i); startAutoPlay(); });
  });
}

/* ✏️ ใหม่: pause on hover */
if (slider) {
  slider.addEventListener("mouseenter", stopAutoPlay);
  slider.addEventListener("mouseleave", startAutoPlay);
}

/* ✏️ ใหม่: keyboard support */
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft")  { stopAutoPlay(); prevSlide(); startAutoPlay(); }
  if (e.key === "ArrowRight") { stopAutoPlay(); nextSlide(); startAutoPlay(); }
});

/* ── เริ่มต้น ──────────────────────────────────────────────── */
showSlide(0);
startAutoPlay();
