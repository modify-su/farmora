/* ================================================================
   FILE: slide.js
   ────────────────────────────────────────────────────────────────
   🌿 Farmora Official — Hero Slider Controller
   - เชื่อมโยงข้อมูลสไลด์แบบไดนามิกจาก localStorage (farmora_slides_v2)
   - รองรับการแสดงภาพ Foreground, Backdrop Blur, แท็ก, และปุ่มลิงก์
   - รองรับลิงก์เปิดในแท็บใหม่ (_blank) หรือหน้าเดิม
   - Dot indicators ซิงค์กับ slide ปัจจุบัน
   - Pause auto-play เมื่อ hover บน slider
   - Keyboard arrow key support
   - Real-time cross-tab sync เมื่อแก้ไขสไลด์จากระบบหลังบ้าน
   ================================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'farmora_slides_v2';
  let slideIndex = 0;
  let autoPlayTimer = null;
  let slides = [];
  let dots = [];
  let tabs = [];

  function resolveImg(path) {
    const isRoot = !(/[\\/]frontend[\\/]html/i.test(window.location.pathname || window.location.href));
    if (!path) {
      return isRoot ? 'frontend/images/picture 1.jpg' : '../images/picture 1.jpg';
    }
    if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;

    // Remove any prefixes like ../frontend/images/, frontend/images/, ../images/, images/, ../frontend/, etc.
    let clean = path
      .replace(/^(\.\.\/)+frontend\/images\//, '')
      .replace(/^frontend\/images\//, '')
      .replace(/^(\.\.\/)+images\//, '')
      .replace(/^images\//, '')
      .replace(/^(\.\.\/)+frontend\//, '')
      .replace(/^frontend\//, '')
      .replace(/^(\.\.\/)+/, '');

    if (isRoot) {
      return 'frontend/images/' + clean;
    } else {
      return '../images/' + clean;
    }
  }

  function resolveLink(url) {
    if (!url || url === '#') return '#';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('#') || url.startsWith('javascript:')) return url;

    const isRoot = !(/[\\/]frontend[\\/]html/i.test(window.location.pathname || window.location.href));
    if (url.includes('backend/')) {
      return isRoot ? 'backend/index.html' : '../../backend/index.html';
    }

    // Strip leading ../frontend/html/ or frontend/html/ or ../
    let clean = url
      .replace(/^(\.\.\/)+frontend\/html\//, '')
      .replace(/^frontend\/html\//, '')
      .replace(/^(\.\.\/)+/, '')
      .replace(/^(\.\/)+/, '');

    return clean;
  }

  function renderDynamicSlides() {
    const slidesContainer = document.querySelector('.news-slider .slides');
    const dotsContainer = document.querySelector('.news-slider .slide-dots');
    if (!slidesContainer) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return; // Do not overwrite existing static slides if nothing stored

      const list = JSON.parse(stored).filter(s => s && s.isActive !== false);
      if (!list || list.length === 0) return; // Do not wipe out static slides if list is empty

      list.sort((a, b) => (a.order || 0) - (b.order || 0));

      slidesContainer.innerHTML = list.map((s, idx) => `
        <div class="slide ${idx === 0 ? 'active' : ''}">
          <div class="slide-backdrop">
            <img src="${resolveImg(s.bgImage || s.fgImage)}" alt="" class="backdrop-img">
            <div class="backdrop-overlay"></div>
          </div>
          <div class="slide-inner">
            <div class="slide-image">
              <img src="${resolveImg(s.fgImage)}" alt="${s.title || ''}">
            </div>
            <div class="slide-content">
              <div class="tags">
                ${s.tag1 ? `<span class="tag">${s.tag1}</span>` : ''}
                ${s.tag2 ? `<span class="tag">${s.tag2}</span>` : ''}
              </div>
              <h2>${s.title || ''}</h2>
              <p>${s.desc || ''}</p>
              <a href="${resolveLink(s.btnLink || '#')}" class="btn-read" ${s.openNewTab ? 'target="_blank" rel="noopener"' : ''}>
                <span>${s.btnText || 'อ่านต่อ'}</span>
                <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      `).join('');

      if (dotsContainer) {
        dotsContainer.innerHTML = list.map((_, idx) => `
          <button class="dot ${idx === 0 ? 'active' : ''}" aria-label="slide ${idx + 1}"></button>
        `).join('');
      }
    } catch (e) {
      console.warn('Error loading dynamic slides from localStorage:', e);
    }
  }

  function initSlider() {
    renderDynamicSlides();

    slides = document.querySelectorAll('.slide');
    dots = document.querySelectorAll('.dot');
    tabs = document.querySelectorAll('.slider-tab');
    const leftArrow = document.querySelector('.arrow.left');
    const rightArrow = document.querySelector('.arrow.right');
    const slider = document.querySelector('.news-slider');

    if (!slides || slides.length === 0) return;

    function showSlide(index) {
      if (slides.length === 0) return;
      index = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      if (tabs && tabs.length > 0) {
        tabs.forEach((tab, i) => {
          tab.classList.toggle('active', i === index);
        });
      }

      slideIndex = index;
    }

    function nextSlide() {
      showSlide(slideIndex + 1);
    }

    function prevSlide() {
      showSlide(slideIndex - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      if (slides.length > 1) {
        autoPlayTimer = setInterval(nextSlide, 5000);
      }
    }

    function stopAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    if (leftArrow) leftArrow.onclick = () => { stopAutoPlay(); prevSlide(); startAutoPlay(); };
    if (rightArrow) rightArrow.onclick = () => { stopAutoPlay(); nextSlide(); startAutoPlay(); };

    dots.forEach((dot, i) => {
      dot.onclick = () => { stopAutoPlay(); showSlide(i); startAutoPlay(); };
    });

    tabs.forEach((tab, i) => {
      tab.onclick = () => { stopAutoPlay(); showSlide(i); startAutoPlay(); };
    });

    if (slider) {
      slider.onmouseenter = stopAutoPlay;
      slider.onmouseleave = startAutoPlay;
    }

    document.onkeydown = (e) => {
      if (e.key === 'ArrowLeft') { stopAutoPlay(); prevSlide(); startAutoPlay(); }
      if (e.key === 'ArrowRight') { stopAutoPlay(); nextSlide(); startAutoPlay(); }
    };

    showSlide(0);
    startAutoPlay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlider);
  } else {
    initSlider();
  }

  // Cross-tab real-time sync when slides change in backend
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      initSlider();
    }
  });

  window.addEventListener('farmora:dataChanged', (e) => {
    if (!e.detail || e.detail.key === STORAGE_KEY) {
      initSlider();
    }
  });

})();
