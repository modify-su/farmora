/* ==========================================================================
   🌿 FARMORA OFFICIAL — About Us Dynamic Loader (about.js)
   ==========================================================================
   โหลดข้อมูลหน้าเกี่ยวกับเราจาก localStorage ('farmora_about_v2') ที่จัดการผ่าน
   ระบบหลังบ้าน (Backend Admin) แบบ Realtime
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'farmora_about_v2';

  // ตรวจสอบและแปลง path รูปภาพให้เหมาะสมกับ root vs frontend/html
  function resolveImgPath(src) {
    const isRoot = !(/[\\/]frontend[\\/]html/i.test(window.location.pathname || window.location.href));
    if (!src) {
      return isRoot ? 'frontend/images/picture 1.jpg' : '../images/picture 1.jpg';
    }
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return src;

    let clean = src
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

  function getAboutData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Could not parse About data from localStorage', e);
    }
    return null;
  }

  function renderAboutPage() {
    const data = getAboutData();
    if (!data) return; // หากไม่มีข้อมูลที่แก้ไข ใช้โครงสร้าง HTML เดิม

    // 1. Hero Banner
    if (data.hero) {
      const badgeEl = document.getElementById('aboutHeroBadge');
      const titleEl = document.getElementById('aboutHeroTitle');
      const subtitleEl = document.getElementById('aboutHeroSubtitle');

      if (badgeEl && data.hero.badge) badgeEl.textContent = data.hero.badge;
      if (titleEl && data.hero.title) titleEl.textContent = data.hero.title;
      if (subtitleEl && data.hero.subtitle) subtitleEl.textContent = data.hero.subtitle;
    }

    // 2. Stats Bar
    if (data.stats) {
      const statsGrid = document.getElementById('aboutStatsGrid');
      if (statsGrid) {
        statsGrid.innerHTML = `
          <div class="stat-item">
            <span class="stat-number">${data.stats.stat1Num || '30+'}</span>
            <span class="stat-label">${data.stats.stat1Label || 'ปีแห่งประสบการณ์'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${data.stats.stat2Num || '500+'}</span>
            <span class="stat-label">${data.stats.stat2Label || 'รายการผลิตภัณฑ์เกษตร'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${data.stats.stat3Num || '10,000+'}</span>
            <span class="stat-label">${data.stats.stat3Label || 'เกษตรกรและร้านค้าไว้วางใจ'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${data.stats.stat4Num || '77'}</span>
            <span class="stat-label">${data.stats.stat4Label || 'จังหวัดเครือข่ายจัดส่งทั่วไทย'}</span>
          </div>
        `;
      }
    }

    // 3. Our Story
    if (data.story) {
      const compEl = document.getElementById('aboutStoryCompany');
      const titleEl = document.getElementById('aboutStoryTitle');
      const highlightEl = document.getElementById('aboutStoryHighlight');
      const imgEl = document.getElementById('aboutStoryImage');
      const badgeYearEl = document.getElementById('aboutStoryBadgeYear');
      const badgeTextEl = document.getElementById('aboutStoryBadgeText');
      const desc1El = document.getElementById('aboutStoryDesc1');
      const desc2El = document.getElementById('aboutStoryDesc2');
      const checksEl = document.getElementById('aboutStoryChecklist');

      if (compEl && data.story.companyName) compEl.textContent = data.story.companyName;
      if (titleEl && data.story.title) titleEl.innerHTML = data.story.title.replace(/\n/g, '<br>');
      if (highlightEl && data.story.highlight) highlightEl.textContent = data.story.highlight;
      if (imgEl && data.story.image) imgEl.src = resolveImgPath(data.story.image);
      if (badgeYearEl && data.story.badgeYear) badgeYearEl.textContent = data.story.badgeYear;
      if (badgeTextEl && data.story.badgeText) badgeTextEl.textContent = data.story.badgeText;
      if (desc1El && data.story.desc1) desc1El.textContent = data.story.desc1;
      if (desc2El && data.story.desc2) desc2El.textContent = data.story.desc2;

      if (checksEl && Array.isArray(data.story.checkpoints)) {
        checksEl.innerHTML = data.story.checkpoints
          .filter(Boolean)
          .map(c => `
            <li>
              <i class="fa-solid fa-circle-check"></i>
              <span>${c}</span>
            </li>
          `).join('');
      }
    }

    // 4. Vision & Mission
    if (data.visionMission) {
      const vEl = document.getElementById('aboutVisionText');
      const mEl = document.getElementById('aboutMissionText');
      if (vEl && data.visionMission.vision) vEl.textContent = data.visionMission.vision;
      if (mEl && data.visionMission.mission) mEl.textContent = data.visionMission.mission;
    }

    // 5. Timeline List (Dynamic)
    if (Array.isArray(data.timeline) && data.timeline.length > 0) {
      const timelineEl = document.getElementById('aboutTimelineList');
      if (timelineEl) {
        timelineEl.innerHTML = data.timeline.map(item => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
              <span class="timeline-year">${item.year}</span>
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
            </div>
          </div>
        `).join('');
      }
    }

    // 6. Core Values
    if (Array.isArray(data.values) && data.values.length > 0) {
      const valuesEl = document.getElementById('aboutValuesGrid');
      if (valuesEl) {
        valuesEl.innerHTML = data.values.map(val => `
          <div class="value-box">
            <div class="value-box-icon">
              <i class="fa-solid ${val.icon || 'fa-seedling'}"></i>
            </div>
            <h4>${val.title}</h4>
            <p>${val.desc}</p>
          </div>
        `).join('');
      }
    }
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAboutPage);
  } else {
    renderAboutPage();
  }

  // Cross-tab and live sync
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      renderAboutPage();
    }
  });

  window.addEventListener('farmora:dataChanged', (e) => {
    if (!e.detail || e.detail.key === STORAGE_KEY) {
      renderAboutPage();
    }
  });

})();
