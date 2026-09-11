/* ==========================================================================
   🌿 FARMORA OFFICIAL — Backend Admin JS (admin.js)
   ==========================================================================
   ตรรกะควบคุมระบบหลังบ้านครบวงจร:
   - ตรวจสอบสิทธิ์ เข้าสู่ระบบ / ออกจากระบบ
   - การสลับแท็บเมนู (Tabs)
   - การจัดการสไลด์หน้าแรก (Hero Slides พร้อมภาพหน้า Foreground และภาพหลัง Backdrop)
   - การจัดการข่าวสารและกิจกรรม (News & Events แยกตามหมวดหมู่)
   - การจัดการบทความเกษตร (Articles)
   - การจัดการสินค้าเกษตร 8 หมวดหมู่ (Products)
   - การตั้งค่าเมนูเว็บไซต์ (Navigation Menus)
   - คลังรูปภาพ (Media Library พร้อมอัปโหลดและคัดลอก Path)
   - สำรองและกู้คืนข้อมูล (Backup & Restore JSON)
   ========================================================================== */

(function (window) {
  'use strict';

  const DS = window.FarmoraDataStore;
  let currentTab = 'overview';
  let activeModal = null;

  /* --------------------------------------------------------------------------
     1. Initialization
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initNavigation();
    initMediaUploader();
    applyTheme();
    renderAll();

    // ฟัง Event เมื่อข้อมูลมีการเปลี่ยนแปลง
    window.addEventListener('farmora:dataChanged', () => {
      renderAll();
    });

    // ฟัง Event เมื่อมีการเปลี่ยนธีม CI
    window.addEventListener('farmora:themeChanged', (e) => {
      applyTheme(e.detail);
      renderThemeSettings();
    });

    window.addEventListener('storage', () => {
      applyTheme();
      renderAll();
    });
  });

  function renderAll() {
    renderStats();
    renderSlidesList();
    renderAboutForm();
    renderFeaturedNewsBanner();
    renderNewsTable();
    renderArticlesTable();
    renderProductsTable();
    renderOrdersTable();
    renderMenusTable();
    renderMediaGrid();
    renderThemeSettings();
  }

  /* --------------------------------------------------------------------------
     2. Authentication
     -------------------------------------------------------------------------- */
  function checkAuth() {
    const isAuthed = localStorage.getItem('farmora_admin_authed');
    const authOverlay = document.getElementById('authOverlay');
    if (authOverlay) {
      if (isAuthed === 'true') {
        authOverlay.style.display = 'none';
      } else {
        authOverlay.style.display = 'flex';
      }
    }
  }

  function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const userInput = document.getElementById('authUsername');
    const passInput = document.getElementById('authPassword');
    const user = (userInput ? userInput.value : 'admin').trim();
    const pass = (passInput ? passInput.value : '').trim();

    // Simple Admin Auth (ยอมรับทั้ง farmora2025 และ farmora2026)
    if (user !== 'admin' || (pass !== 'farmora2025' && pass !== 'farmora2026')) {
      const err = document.getElementById('authError');
      if (err) {
        err.style.display = 'block';
        err.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (กรุณาใช้ admin / farmora2026)';
      }
      return;
    }

    const err = document.getElementById('authError');
    if (err) err.style.display = 'none';

    localStorage.setItem('farmora_admin_authed', 'true');
    const authOverlay = document.getElementById('authOverlay');
    if (authOverlay) authOverlay.style.display = 'none';
    showToast('เข้าสู่ระบบหลังบ้านเรียบร้อยแล้ว');
  }

  function handleLogout() {
    if (confirm('คุณต้องการออกจากระบบจัดการหลังบ้านหรือไม่?')) {
      localStorage.removeItem('farmora_admin_authed');
      const authOverlay = document.getElementById('authOverlay');
      if (authOverlay) authOverlay.style.display = 'flex';
      showToast('ออกจากระบบเรียบร้อยแล้ว');
    }
  }

  /* --------------------------------------------------------------------------
     3. Navigation & Tabs
     -------------------------------------------------------------------------- */
  const TAB_TITLES = {
    overview: 'ภาพรวมระบบ (Overview)',
    slides: 'จัดการสไลด์หน้าแรก (Hero Slides)',
    about: 'จัดการหน้าเกี่ยวกับเรา (About Us)',
    news: 'จัดการข่าวสารและกิจกรรม (News & Events)',
    articles: 'จัดการบทความเกษตร (Articles)',
    products: 'จัดการสินค้า (Products)',
    orders: 'รายการคำสั่งซื้อและการจัดส่ง (Orders Management)',
    menus: 'ตั้งค่าเมนูเว็บไซต์ (Navigation Menus)',
    media: 'คลังรูปภาพ (Media Library)',
    theme: 'ปรับแต่งธีมและสี UX/UI (Theme & Colors)',
    backup: 'สำรองและกู้คืนข้อมูล (Backup & Restore)'
  };

  function initNavigation() {
    const links = document.querySelectorAll('.sidebar-link[data-tab]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;
        switchTab(tab);
      });
    });

    // Mobile Sidebar Toggle
    const toggleBtn = document.getElementById('btnToggleSidebar');
    const sidebar = document.getElementById('adminSidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Close mobile sidebar on outside click
    document.addEventListener('click', (e) => {
      if (sidebar && sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });

    // Global Search / Filter Listeners
    document.getElementById('searchNews')?.addEventListener('input', renderNewsTable);
    document.getElementById('filterNewsCat')?.addEventListener('change', renderNewsTable);

    document.getElementById('searchArticles')?.addEventListener('input', renderArticlesTable);
    document.getElementById('filterArticleCat')?.addEventListener('change', renderArticlesTable);

    document.getElementById('searchProducts')?.addEventListener('input', renderProductsTable);
    document.getElementById('filterProductCat')?.addEventListener('change', renderProductsTable);

    document.getElementById('searchOrders')?.addEventListener('input', renderOrdersTable);
    document.getElementById('filterOrderStatus')?.addEventListener('change', renderOrdersTable);
    document.getElementById('filterOrderPayment')?.addEventListener('change', renderOrdersTable);
  }

  function switchTab(tab) {
    currentTab = tab;

    // Sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.toggle('active', link.dataset.tab === tab);
    });

    // Panes active state
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    const targetPane = document.getElementById(`pane-${tab}`);
    if (targetPane) targetPane.classList.add('active');

    // Page Title
    const titleEl = document.getElementById('pageHeaderTitle');
    if (titleEl) titleEl.textContent = TAB_TITLES[tab] || 'ระบบหลังบ้าน';

    // Auto close sidebar on mobile
    const sidebar = document.getElementById('adminSidebar');
    if (window.innerWidth <= 992 && sidebar) {
      sidebar.classList.remove('open');
    }
  }

  /* --------------------------------------------------------------------------
     4. Overview Stats
     -------------------------------------------------------------------------- */
  function renderStats() {
    const slides = DS.Slides.getAll();
    const news = DS.News.getAll();
    const articles = DS.Articles.getAll();
    const products = DS.Products.getAll();
    const media = DS.Media.getAll();
    const orderStats = DS.Orders ? DS.Orders.getStats() : { totalOrders: 0, pendingCount: 0, shippingCount: 0, completedCount: 0, totalRevenue: 0 };

    document.getElementById('statSlides') && (document.getElementById('statSlides').textContent = slides.length);
    document.getElementById('statNews') && (document.getElementById('statNews').textContent = news.length);
    document.getElementById('statArticles') && (document.getElementById('statArticles').textContent = articles.length);
    document.getElementById('statProducts') && (document.getElementById('statProducts').textContent = products.length);
    document.getElementById('statMedia') && (document.getElementById('statMedia').textContent = media.length);
    document.getElementById('statOrders') && (document.getElementById('statOrders').textContent = orderStats.totalOrders);
    document.getElementById('statRevenue') && (document.getElementById('statRevenue').textContent = `฿${orderStats.totalRevenue.toLocaleString('th-TH')}`);
    document.getElementById('quickPendingOrders') && (document.getElementById('quickPendingOrders').textContent = orderStats.pendingCount);

    // Sidebar badges
    document.getElementById('badgeSlidesCount') && (document.getElementById('badgeSlidesCount').textContent = slides.length);
    document.getElementById('badgeNewsCount') && (document.getElementById('badgeNewsCount').textContent = news.length);
    document.getElementById('badgeArticlesCount') && (document.getElementById('badgeArticlesCount').textContent = articles.length);
    document.getElementById('badgeProductsCount') && (document.getElementById('badgeProductsCount').textContent = products.length);
    document.getElementById('badgeMediaCount') && (document.getElementById('badgeMediaCount').textContent = media.length);
    document.getElementById('badgeOrdersCount') && (document.getElementById('badgeOrdersCount').textContent = orderStats.pendingCount || orderStats.totalOrders);

    // Pane Orders KPI Cards
    document.getElementById('orderStatTotal') && (document.getElementById('orderStatTotal').textContent = orderStats.totalOrders);
    document.getElementById('orderStatPending') && (document.getElementById('orderStatPending').textContent = orderStats.pendingCount);
    document.getElementById('orderStatShipping') && (document.getElementById('orderStatShipping').textContent = orderStats.shippingCount);
    document.getElementById('orderStatCompleted') && (document.getElementById('orderStatCompleted').textContent = orderStats.completedCount);
    document.getElementById('orderStatRevenue') && (document.getElementById('orderStatRevenue').textContent = `฿${orderStats.totalRevenue.toLocaleString('th-TH')}`);
  }

  /* --------------------------------------------------------------------------
     5. Hero Slides Management (สไลด์หน้าแรก)
     -------------------------------------------------------------------------- */
  function renderSlidesList() {
    const listEl = document.getElementById('slidesList');
    if (!listEl) return;

    const slides = DS.Slides.getAll().sort((a, b) => (a.order || 0) - (b.order || 0));

    if (slides.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-images" style="font-size: 3rem; margin-bottom: 12px; color: #ccc;"></i>
          <p>ยังไม่มีสไลด์ในระบบ กดปุ่ม "เพิ่มสไลด์ใหม่" เพื่อเริ่มต้น</p>
        </div>`;
      return;
    }

    listEl.innerHTML = slides.map(s => `
      <div class="slide-item-card">
        <div class="slide-dual-preview">
          <img src="${DS.resolveImg(s.bgImage)}" alt="" class="slide-dual-bg">
          <img src="${DS.resolveImg(s.fgImage)}" alt="${s.title}" class="slide-dual-fg">
        </div>
        <div class="slide-item-content">
          <div class="slide-item-meta">
            <span class="badge badge-green">${s.tag1 || 'ข่าวสาร'}</span>
            ${s.tag2 ? `<span class="badge badge-blue">${s.tag2}</span>` : ''}
            <span class="badge ${s.isActive ? 'badge-green' : 'badge-gray'}">${s.isActive ? 'แสดงผล' : 'ปิดการแสดง'}</span>
            <span style="font-size: 12.5px; color: var(--text-muted); margin-left: auto;">ลำดับที่: ${s.order || 1}</span>
          </div>
          <h3 class="slide-item-title">${s.title}</h3>
          <p class="slide-item-desc">${s.desc || '-'}</p>
          <div class="slide-item-footer">
            <span><i class="fa-solid fa-link"></i> ลิงก์: <code>${s.btnLink || '#'}</code></span>
            <span><i class="fa-solid fa-mouse-pointer"></i> ปุ่ม: "${s.btnText || 'อ่านต่อ'}"</span>
          </div>
        </div>
        <div class="tbl-actions">
          <button class="btn btn-outline btn-sm" onclick="AdminApp.openSlideModal('${s.id}')" title="แก้ไขสไลด์">
            <i class="fa-solid fa-pen-to-square"></i> แก้ไข
          </button>
          <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteSlide('${s.id}')" title="ลบสไลด์">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  function openSlideModal(id) {
    const modal = document.getElementById('slideModal');
    if (!modal) return;

    document.getElementById('slideModalTitle').textContent = id ? '✏️ แก้ไขสไลด์' : '➕ เพิ่มสไลด์ใหม่';
    document.getElementById('slideId').value = id || '';

    if (id) {
      const s = DS.Slides.getById(id);
      if (s) {
        document.getElementById('slideTitle').value = s.title || '';
        document.getElementById('slideTag1').value = s.tag1 || 'ข่าวสาร';
        document.getElementById('slideTag2').value = s.tag2 || '';
        document.getElementById('slideDesc').value = s.desc || '';
        document.getElementById('slideFgImage').value = s.fgImage || '';
        document.getElementById('slideBgImage').value = s.bgImage || '';
        document.getElementById('slideBtnText').value = s.btnText || 'อ่านต่อ';
        document.getElementById('slideBtnLink').value = s.btnLink || '';
        document.getElementById('slideOrder').value = s.order || 1;
        document.getElementById('slideIsActive').checked = s.isActive !== false;
        document.getElementById('slideOpenNewTab').checked = !!s.openNewTab;
        const qLink = document.getElementById('slideQuickLink');
        if (qLink) qLink.value = '';
      }
    } else {
      document.getElementById('slideForm').reset();
      document.getElementById('slideTag1').value = 'ข่าวสาร';
      document.getElementById('slideTag2').value = 'บทความ';
      document.getElementById('slideBtnText').value = 'อ่านต่อ';
      document.getElementById('slideBtnLink').value = '';
      document.getElementById('slideOrder').value = (DS.Slides.getAll().length + 1);
      document.getElementById('slideIsActive').checked = true;
      document.getElementById('slideOpenNewTab').checked = false;
      document.getElementById('slideFgImage').value = '../frontend/images/picture 1.jpg';
      document.getElementById('slideBgImage').value = '../frontend/images/picture 1.jpg';
      const qLink = document.getElementById('slideQuickLink');
      if (qLink) qLink.value = '';
    }

    updateSlideLivePreview();
    openModal('slideModal');
  }

  function updateSlideLivePreview() {
    const fg = document.getElementById('slideFgImage')?.value || '../frontend/images/picture 1.jpg';
    const bg = document.getElementById('slideBgImage')?.value || fg;
    const previewFg = document.getElementById('previewSlideFg');
    const previewBg = document.getElementById('previewSlideBg');
    if (previewFg) previewFg.src = DS.resolveImg(fg);
    if (previewBg) previewBg.src = DS.resolveImg(bg);
  }

  function copyForegroundToBackground() {
    const fg = document.getElementById('slideFgImage')?.value.trim();
    if (!fg) {
      showToast('กรุณาระบุหรืออัปโหลดภาพด้านหน้าก่อน', true);
      return;
    }
    const bgInput = document.getElementById('slideBgImage');
    if (bgInput) {
      bgInput.value = fg;
      updateSlideLivePreview();
      showToast('คัดลอกภาพด้านหน้ามาใช้เป็นภาพพื้นหลังเบลอเรียบร้อย');
    }
  }

  function applyQuickLink(targetInputId, url) {
    if (!url) return;
    const target = document.getElementById(targetInputId);
    if (target) {
      target.value = url;
      showToast(`แนบลิงก์ปลายทาง: ${url}`);
    }
  }

  function saveSlide(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('slideId').value;
    const slideData = {
      id: id || undefined,
      title: document.getElementById('slideTitle').value.trim(),
      tag1: document.getElementById('slideTag1').value.trim(),
      tag2: document.getElementById('slideTag2').value.trim(),
      desc: document.getElementById('slideDesc').value.trim(),
      fgImage: document.getElementById('slideFgImage').value.trim(),
      bgImage: document.getElementById('slideBgImage').value.trim(),
      btnText: document.getElementById('slideBtnText').value.trim() || 'อ่านต่อ',
      btnLink: document.getElementById('slideBtnLink').value.trim() || '#',
      openNewTab: document.getElementById('slideOpenNewTab').checked,
      order: parseInt(document.getElementById('slideOrder').value || '1', 10),
      isActive: document.getElementById('slideIsActive').checked
    };

    if (!slideData.title) {
      alert('กรุณาระบุหัวข้อสไลด์');
      return;
    }

    DS.Slides.save(slideData);
    closeModal();
    showToast(id ? 'บันทึกการแก้ไขสไลด์เรียบร้อยแล้ว' : 'เพิ่มสไลด์ใหม่สำเร็จ');
    renderSlidesList();
    renderStats();
  }

  function deleteSlide(id) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสไลด์นี้?')) {
      DS.Slides.delete(id);
      showToast('ลบสไลด์เรียบร้อยแล้ว');
      renderSlidesList();
      renderStats();
    }
  }

  /* --------------------------------------------------------------------------
     5.5 About Us (จัดการหน้าเกี่ยวกับเรา)
     -------------------------------------------------------------------------- */
  function renderAboutForm() {
    if (!DS || !DS.About) return;
    const data = DS.About.get();
    if (!data) return;

    // 1. Hero Banner
    const hero = data.hero || {};
    const heroBadge = document.getElementById('aboutHeroBadge');
    const heroTitle = document.getElementById('aboutHeroTitle');
    const heroSubtitle = document.getElementById('aboutHeroSubtitle');
    if (heroBadge) heroBadge.value = hero.badge || '';
    if (heroTitle) heroTitle.value = hero.title || '';
    if (heroSubtitle) heroSubtitle.value = hero.subtitle || '';

    // 2. Stats
    const stats = data.stats || {};
    const stat1Num = document.getElementById('aboutStat1Num');
    const stat1Label = document.getElementById('aboutStat1Label');
    const stat2Num = document.getElementById('aboutStat2Num');
    const stat2Label = document.getElementById('aboutStat2Label');
    const stat3Num = document.getElementById('aboutStat3Num');
    const stat3Label = document.getElementById('aboutStat3Label');
    const stat4Num = document.getElementById('aboutStat4Num');
    const stat4Label = document.getElementById('aboutStat4Label');

    if (stat1Num) stat1Num.value = stats.stat1Num || '';
    if (stat1Label) stat1Label.value = stats.stat1Label || '';
    if (stat2Num) stat2Num.value = stats.stat2Num || '';
    if (stat2Label) stat2Label.value = stats.stat2Label || '';
    if (stat3Num) stat3Num.value = stats.stat3Num || '';
    if (stat3Label) stat3Label.value = stats.stat3Label || '';
    if (stat4Num) stat4Num.value = stats.stat4Num || '';
    if (stat4Label) stat4Label.value = stats.stat4Label || '';

    // 3. Our Story
    const story = data.story || {};
    const storyCompany = document.getElementById('aboutStoryCompany');
    const storyTitle = document.getElementById('aboutStoryTitle');
    const storyHighlight = document.getElementById('aboutStoryHighlight');
    const storyImage = document.getElementById('aboutStoryImage');
    const storyBadgeYear = document.getElementById('aboutStoryBadgeYear');
    const storyBadgeText = document.getElementById('aboutStoryBadgeText');
    const storyDesc1 = document.getElementById('aboutStoryDesc1');
    const storyDesc2 = document.getElementById('aboutStoryDesc2');

    if (storyCompany) storyCompany.value = story.companyName || '';
    if (storyTitle) storyTitle.value = story.title || '';
    if (storyHighlight) storyHighlight.value = story.highlight || '';
    if (storyImage) storyImage.value = story.image || '';
    if (storyBadgeYear) storyBadgeYear.value = story.badgeYear || '';
    if (storyBadgeText) storyBadgeText.value = story.badgeText || '';
    if (storyDesc1) storyDesc1.value = story.desc1 || '';
    if (storyDesc2) storyDesc2.value = story.desc2 || '';

    const checks = story.checkpoints || [];
    const check1 = document.getElementById('aboutStoryCheck1');
    const check2 = document.getElementById('aboutStoryCheck2');
    const check3 = document.getElementById('aboutStoryCheck3');
    if (check1) check1.value = checks[0] || '';
    if (check2) check2.value = checks[1] || '';
    if (check3) check3.value = checks[2] || '';

    updateAboutStoryImgPreview();

    // 4. Vision & Mission
    const vm = data.visionMission || {};
    const vision = document.getElementById('aboutVision');
    const mission = document.getElementById('aboutMission');
    if (vision) vision.value = vm.vision || '';
    if (mission) mission.value = vm.mission || '';

    // 5. Core Values
    const vals = data.values || [];
    for (let i = 1; i <= 4; i++) {
      const v = vals[i - 1] || {};
      const iconEl = document.getElementById(`aboutVal${i}Icon`);
      const titleEl = document.getElementById(`aboutVal${i}Title`);
      const descEl = document.getElementById(`aboutVal${i}Desc`);
      if (iconEl) iconEl.value = v.icon || '';
      if (titleEl) titleEl.value = v.title || '';
      if (descEl) descEl.value = v.desc || '';
    }

    // 6. Timeline Table
    renderTimelineTable();
  }

  function updateAboutStoryImgPreview() {
    const input = document.getElementById('aboutStoryImage');
    const preview = document.getElementById('previewAboutStoryImg');
    if (input && preview) {
      preview.src = DS.resolveImg(input.value.trim(), '../frontend/images/picture 1.jpg');
    }
  }

  function saveAboutForm(e) {
    if (e) e.preventDefault();
    const current = DS.About.get();

    const updated = {
      hero: {
        badge: (document.getElementById('aboutHeroBadge')?.value || '').trim(),
        title: (document.getElementById('aboutHeroTitle')?.value || '').trim(),
        subtitle: (document.getElementById('aboutHeroSubtitle')?.value || '').trim()
      },
      stats: {
        stat1Num: (document.getElementById('aboutStat1Num')?.value || '').trim(),
        stat1Label: (document.getElementById('aboutStat1Label')?.value || '').trim(),
        stat2Num: (document.getElementById('aboutStat2Num')?.value || '').trim(),
        stat2Label: (document.getElementById('aboutStat2Label')?.value || '').trim(),
        stat3Num: (document.getElementById('aboutStat3Num')?.value || '').trim(),
        stat3Label: (document.getElementById('aboutStat3Label')?.value || '').trim(),
        stat4Num: (document.getElementById('aboutStat4Num')?.value || '').trim(),
        stat4Label: (document.getElementById('aboutStat4Label')?.value || '').trim()
      },
      story: {
        companyName: (document.getElementById('aboutStoryCompany')?.value || '').trim(),
        title: (document.getElementById('aboutStoryTitle')?.value || '').trim(),
        highlight: (document.getElementById('aboutStoryHighlight')?.value || '').trim(),
        image: (document.getElementById('aboutStoryImage')?.value || '').trim(),
        badgeYear: (document.getElementById('aboutStoryBadgeYear')?.value || '').trim(),
        badgeText: (document.getElementById('aboutStoryBadgeText')?.value || '').trim(),
        desc1: (document.getElementById('aboutStoryDesc1')?.value || '').trim(),
        desc2: (document.getElementById('aboutStoryDesc2')?.value || '').trim(),
        checkpoints: [
          (document.getElementById('aboutStoryCheck1')?.value || '').trim(),
          (document.getElementById('aboutStoryCheck2')?.value || '').trim(),
          (document.getElementById('aboutStoryCheck3')?.value || '').trim()
        ].filter(Boolean)
      },
      visionMission: {
        vision: (document.getElementById('aboutVision')?.value || '').trim(),
        mission: (document.getElementById('aboutMission')?.value || '').trim()
      },
      values: [
        {
          id: 'v1',
          icon: (document.getElementById('aboutVal1Icon')?.value || '').trim() || 'fa-seedling',
          title: (document.getElementById('aboutVal1Title')?.value || '').trim(),
          desc: (document.getElementById('aboutVal1Desc')?.value || '').trim()
        },
        {
          id: 'v2',
          icon: (document.getElementById('aboutVal2Icon')?.value || '').trim() || 'fa-truck-fast',
          title: (document.getElementById('aboutVal2Title')?.value || '').trim(),
          desc: (document.getElementById('aboutVal2Desc')?.value || '').trim()
        },
        {
          id: 'v3',
          icon: (document.getElementById('aboutVal3Icon')?.value || '').trim() || 'fa-users',
          title: (document.getElementById('aboutVal3Title')?.value || '').trim(),
          desc: (document.getElementById('aboutVal3Desc')?.value || '').trim()
        },
        {
          id: 'v4',
          icon: (document.getElementById('aboutVal4Icon')?.value || '').trim() || 'fa-book-open-reader',
          title: (document.getElementById('aboutVal4Title')?.value || '').trim(),
          desc: (document.getElementById('aboutVal4Desc')?.value || '').trim()
        }
      ],
      timeline: current.timeline || []
    };

    DS.About.save(updated);
    showToast('บันทึกข้อมูลหน้าเกี่ยวกับเรา (About Us) เรียบร้อยแล้ว');
  }

  function renderTimelineTable() {
    const tbody = document.getElementById('timelineTableBody');
    if (!tbody) return;

    const data = DS.About.get();
    const timeline = data.timeline || [];

    if (timeline.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">ยังไม่มีข้อมูลหมุดไทม์ไลน์ กดปุ่ม "เพิ่มหมุดไทม์ไลน์" เพื่อสร้างรายการแรก</td></tr>`;
      return;
    }

    tbody.innerHTML = timeline.map(item => `
      <tr>
        <td><strong style="color: var(--primary-green); font-size: 15px;">${item.year}</strong></td>
        <td><strong>${item.title}</strong></td>
        <td style="color: #4a5568; font-size: 13.5px; line-height: 1.5;">${item.desc}</td>
        <td style="text-align: center;">
          <div class="tbl-actions" style="justify-content: center;">
            <button class="btn btn-outline btn-sm" onclick="AdminApp.openTimelineModal('${item.id}')" title="แก้ไข">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteTimeline('${item.id}')" title="ลบ">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openTimelineModal(id) {
    const modal = document.getElementById('timelineModal');
    if (!modal) return;

    document.getElementById('timelineModalTitle').textContent = id ? '✏️ แก้ไขหมุดไทม์ไลน์' : '➕ เพิ่มหมุดไทม์ไลน์ใหม่';
    document.getElementById('timelineId').value = id || '';

    if (id) {
      const data = DS.About.get();
      const item = (data.timeline || []).find(t => t.id === id);
      if (item) {
        document.getElementById('timelineYear').value = item.year || '';
        document.getElementById('timelineTitle').value = item.title || '';
        document.getElementById('timelineDesc').value = item.desc || '';
      }
    } else {
      document.getElementById('timelineForm').reset();
    }

    openModal(modal);
  }

  function saveTimeline(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('timelineId').value;
    const year = document.getElementById('timelineYear').value.trim();
    const title = document.getElementById('timelineTitle').value.trim();
    const desc = document.getElementById('timelineDesc').value.trim();

    if (id) {
      DS.About.updateTimelineItem(id, { year, title, desc });
      showToast('แก้ไขหมุดไทม์ไลน์เรียบร้อยแล้ว');
    } else {
      DS.About.addTimelineItem({ year, title, desc });
      showToast('เพิ่มหมุดไทม์ไลน์ใหม่เรียบร้อยแล้ว');
    }

    closeModal();
    renderTimelineTable();
  }

  function deleteTimeline(id) {
    if (confirm('คุณต้องการลบหมุดไทม์ไลน์นี้หรือไม่?')) {
      DS.About.deleteTimelineItem(id);
      renderTimelineTable();
      showToast('ลบหมุดไทม์ไลน์เรียบร้อยแล้ว');
    }
  }

  /* --------------------------------------------------------------------------
     6. News & Events Management (ข่าวสารและกิจกรรม)
     -------------------------------------------------------------------------- */
  function renderFeaturedNewsBanner() {
    const container = document.getElementById('featuredNewsBannerContainer');
    if (!container) return;

    const featured = DS.News.getFeatured();
    if (!featured) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #047857;">
          <p style="margin-bottom: 12px; font-size: 14px;">ยังไม่มีข่าวเด่นแนะนำที่เลือกไว้</p>
          <button type="button" class="btn btn-primary btn-sm" onclick="AdminApp.openNewsModal()">➕ เพิ่มข่าวสารใหม่และตั้งเป็นข่าวเด่น</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: flex; gap: 20px; align-items: stretch; flex-wrap: wrap; background: #ffffff; border-radius: 12px; padding: 18px; border: 1px solid #d1fae5; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div style="position: relative; width: 240px; min-width: 220px; height: 160px; border-radius: 10px; overflow: hidden; background: #e2e8f0; flex-shrink: 0;">
          <img src="${DS.resolveImg(featured.image)}" alt="${featured.title}" style="width: 100%; height: 100%; object-fit: cover;">
          <span style="position: absolute; top: 8px; left: 8px; background: rgba(5, 150, 105, 0.92); color: #ffffff; font-size: 11.5px; font-weight: 600; padding: 3px 9px; border-radius: 6px; backdrop-filter: blur(4px);">
            ${featured.catName || featured.categoryName || 'ข่าวล่าสุด'}
          </span>
        </div>
        <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-size: 13px; color: #64748b; flex-wrap: wrap;">
              <span style="background: #fef3c7; color: #b45309; font-weight: 700; font-size: 12px; padding: 2px 8px; border-radius: 6px; border: 1px solid #fde68a;">
                <i class="fa-solid fa-star"></i> ข่าวเด่นแนะนำ
              </span>
              <span><i class="fa-regular fa-calendar"></i> ${featured.date || '-'}</span>
              <span><i class="fa-regular fa-eye"></i> ${featured.views || '1,840 ครั้ง'}</span>
              <span><i class="fa-regular fa-user"></i> ${featured.author || 'ทีมข่าว Farmora'}</span>
            </div>
            <h4 style="font-size: 17px; font-weight: 700; color: #1e293b; margin: 0 0 8px 0; line-height: 1.4;">
              ${featured.title}
            </h4>
            <p style="font-size: 13.5px; color: #475569; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${featured.excerpt || ''}
            </p>
          </div>
          <div style="margin-top: 14px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-primary btn-sm" onclick="AdminApp.openNewsModal('${featured.id}')" style="background: #059669; border-color: #059669; font-weight: 600;">
              <i class="fa-solid fa-pen-to-square"></i> แก้ไขข้อมูลข่าวเด่นนี้
            </button>
            <a href="../news.html" target="_blank" class="btn btn-outline btn-sm" style="color: #059669; border-color: #059669;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> ดูหน้าเว็บจริง (news.html)
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function editFeaturedNews() {
    const featured = DS.News.getFeatured();
    if (featured) {
      openNewsModal(featured.id);
    } else {
      openNewsModal();
    }
  }

  function toggleFeaturedNews(id) {
    DS.News.setFeatured(id);
    showToast('ตั้งข่าวนี้เป็น "ข่าวเด่นแนะนำ" เรียบร้อยแล้ว ⭐');
    renderFeaturedNewsBanner();
    renderNewsTable();
  }

  function renderNewsTable() {
    const tbody = document.getElementById('newsTableBody');
    if (!tbody) return;

    let items = DS.News.getAll();
    const search = (document.getElementById('searchNews')?.value || '').toLowerCase().trim();
    const cat = document.getElementById('filterNewsCat')?.value || 'all';

    if (search) {
      items = items.filter(n => (n.title || '').toLowerCase().includes(search) || (n.excerpt || '').toLowerCase().includes(search));
    }
    if (cat !== 'all') {
      items = items.filter(n => n.cat === cat);
    }

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">ไม่พบรายการข่าวสาร</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(n => `
      <tr style="${n.isFeatured ? 'background-color: #f0fdf4;' : ''}">
        <td>
          <div style="position: relative; display: inline-block;">
            <img src="${DS.resolveImg(n.image)}" alt="" class="tbl-thumb">
            ${n.isFeatured ? '<span style="position: absolute; top: -3px; right: -3px; background: #f59e0b; color: #fff; font-size: 9px; padding: 2px 4px; border-radius: 99px; border: 1px solid #fff;" title="ข่าวเด่นแนะนำ"><i class="fa-solid fa-star"></i></span>' : ''}
          </div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 2px;">
            ${n.isFeatured ? '<span style="background: #fef3c7; color: #b45309; font-size: 11px; font-weight: 700; padding: 1px 6px; border-radius: 4px; border: 1px solid #fde68a;"><i class="fa-solid fa-star"></i> ข่าวเด่นแนะนำ</span>' : ''}
            <span class="tbl-title-main" style="font-weight: 600;">${n.title}</span>
          </div>
          <span class="tbl-subtitle">${(n.excerpt || '').substring(0, 70)}...</span>
        </td>
        <td>
          <span class="badge ${n.cat === 'news' ? 'badge-green' : (n.cat === 'activity' ? 'badge-blue' : 'badge-orange')}">
            ${n.catName || n.cat}
          </span>
        </td>
        <td>${n.date || '-'}</td>
        <td><i class="fa-regular fa-eye"></i> ${n.views || '0 ครั้ง'}</td>
        <td>
          <div class="tbl-actions">
            <button class="btn btn-sm ${n.isFeatured ? 'btn-success' : 'btn-outline'}" onclick="AdminApp.toggleFeaturedNews('${n.id}')" title="${n.isFeatured ? 'เป็นข่าวเด่นแนะนำอยู่แล้ว' : 'คลิกเพื่อตั้งเป็นข่าวเด่นประจำหน้าเว็บ'}">
              <i class="fa-solid fa-star" style="${n.isFeatured ? 'color: #ffffff;' : 'color: #f59e0b;'}"></i>
            </button>
            <button class="btn btn-outline btn-sm" onclick="AdminApp.openNewsModal('${n.id}')" title="แก้ไข">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteNews('${n.id}')" title="ลบ">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openNewsModal(id) {
    const modal = document.getElementById('newsModal');
    if (!modal) return;

    document.getElementById('newsModalTitle').textContent = id ? '✏️ แก้ไขข่าวสาร' : '➕ เพิ่มข่าวสารใหม่';
    document.getElementById('newsId').value = id || '';

    if (id) {
      const n = DS.News.getById(id);
      if (n) {
        const featCheck = document.getElementById('newsIsFeatured');
        if (featCheck) featCheck.checked = !!n.isFeatured;
        document.getElementById('newsTitle').value = n.title || '';
        document.getElementById('newsCat').value = n.cat || 'news';
        document.getElementById('newsDate').value = n.date || '';
        const authorInput = document.getElementById('newsAuthor');
        if (authorInput) authorInput.value = n.author || 'ทีมข่าว Farmora';
        const viewsInput = document.getElementById('newsViews');
        if (viewsInput) viewsInput.value = n.views || '1,840 ครั้ง';
        document.getElementById('newsImage').value = n.image || '';
        document.getElementById('newsExcerpt').value = n.excerpt || '';
        document.getElementById('newsContent').value = n.content || '';
        document.getElementById('previewNewsImg').src = DS.resolveImg(n.image);
      }
    } else {
      document.getElementById('newsForm').reset();
      const featCheck = document.getElementById('newsIsFeatured');
      if (featCheck) featCheck.checked = false;
      const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
      document.getElementById('newsDate').value = today;
      const authorInput = document.getElementById('newsAuthor');
      if (authorInput) authorInput.value = 'ทีมข่าว Farmora';
      const viewsInput = document.getElementById('newsViews');
      if (viewsInput) viewsInput.value = '1,840 ครั้ง';
      document.getElementById('newsImage').value = '../frontend/images/news-hero.jpg';
      document.getElementById('previewNewsImg').src = '../frontend/images/news-hero.jpg';
    }

    openModal('newsModal');
  }

  function saveNews(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('newsId').value;
    const catSelect = document.getElementById('newsCat');
    const catName = catSelect.options[catSelect.selectedIndex].text;
    const isFeaturedChecked = document.getElementById('newsIsFeatured')?.checked || false;

    const newsData = {
      id: id || undefined,
      isFeatured: isFeaturedChecked,
      title: document.getElementById('newsTitle').value.trim(),
      cat: catSelect.value,
      catName: catName,
      category: catSelect.value,
      categoryName: catName,
      categoryClass: 'cat-' + catSelect.value,
      date: document.getElementById('newsDate').value.trim(),
      author: (document.getElementById('newsAuthor')?.value || '').trim() || 'ทีมข่าว Farmora',
      views: (document.getElementById('newsViews')?.value || '').trim() || '1,840 ครั้ง',
      image: document.getElementById('newsImage').value.trim() || '../frontend/images/news-hero.jpg',
      excerpt: document.getElementById('newsExcerpt').value.trim(),
      content: document.getElementById('newsContent').value.trim()
    };

    if (!newsData.title) {
      alert('กรุณาระบุหัวข้อข่าว');
      return;
    }

    DS.News.save(newsData);
    closeModal();
    showToast(id ? 'บันทึกข่าวสารเรียบร้อยแล้ว' : 'เพิ่มข่าวสารสำเร็จ');
    renderFeaturedNewsBanner();
    renderNewsTable();
    renderStats();
  }

  function deleteNews(id) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข่าวสารนี้?')) {
      DS.News.delete(id);
      showToast('ลบข่าวสารเรียบร้อยแล้ว');
      renderFeaturedNewsBanner();
      renderNewsTable();
      renderStats();
    }
  }

  /* --------------------------------------------------------------------------
     7. Articles Management (บทความเกษตร)
     -------------------------------------------------------------------------- */
  function renderArticlesTable() {
    const tbody = document.getElementById('articlesTableBody');
    if (!tbody) return;

    let items = DS.Articles.getAll();
    const search = (document.getElementById('searchArticles')?.value || '').toLowerCase().trim();
    const cat = document.getElementById('filterArticleCat')?.value || 'all';

    if (search) {
      items = items.filter(a => (a.title || '').toLowerCase().includes(search) || (a.excerpt || '').toLowerCase().includes(search));
    }
    if (cat !== 'all') {
      items = items.filter(a => a.cat === cat);
    }

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">ไม่พบรายการบทความ</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(a => `
      <tr>
        <td>
          <img src="${DS.resolveImg(a.image)}" alt="" class="tbl-thumb">
        </td>
        <td>
          <span class="tbl-title-main">${a.title}</span>
          <span class="tbl-subtitle">${(a.excerpt || '').substring(0, 70)}...</span>
        </td>
        <td><span class="badge badge-purple">${a.cat || 'ความรู้ทั่วไป'}</span></td>
        <td>${a.date || '-'}</td>
        <td><i class="fa-regular fa-clock"></i> ${a.readTime || '5 นาที'}</td>
        <td>
          <div class="tbl-actions">
            <button class="btn btn-outline btn-sm" onclick="AdminApp.openArticleModal('${a.id}')" title="แก้ไข">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteArticle('${a.id}')" title="ลบ">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openArticleModal(id) {
    const modal = document.getElementById('articleModal');
    if (!modal) return;

    document.getElementById('articleModalTitle').textContent = id ? '✏️ แก้ไขบทความ' : '➕ เพิ่มบทความใหม่';
    document.getElementById('articleId').value = id || '';

    if (id) {
      const a = DS.Articles.getById(id);
      if (a) {
        document.getElementById('articleTitle').value = a.title || '';
        document.getElementById('articleCat').value = a.cat || 'ความรู้เรื่องปุ๋ย';
        document.getElementById('articleDate').value = a.date || '';
        document.getElementById('articleReadTime').value = a.readTime || '5 นาที';
        document.getElementById('articleImage').value = a.image || '';
        document.getElementById('articleExcerpt').value = a.excerpt || '';
        document.getElementById('articleContent').value = a.content || '';
        document.getElementById('previewArticleImg').src = DS.resolveImg(a.image);
      }
    } else {
      document.getElementById('articleForm').reset();
      const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
      document.getElementById('articleDate').value = today;
      document.getElementById('articleReadTime').value = '5 นาที';
      document.getElementById('articleImage').value = '../frontend/images/hero2.jpg';
      document.getElementById('previewArticleImg').src = '../frontend/images/hero2.jpg';
    }

    openModal('articleModal');
  }

  function saveArticle(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('articleId').value;
    const articleData = {
      id: id || undefined,
      title: document.getElementById('articleTitle').value.trim(),
      cat: document.getElementById('articleCat').value,
      date: document.getElementById('articleDate').value.trim(),
      readTime: document.getElementById('articleReadTime').value.trim() || '5 นาที',
      image: document.getElementById('articleImage').value.trim() || '../frontend/images/hero2.jpg',
      excerpt: document.getElementById('articleExcerpt').value.trim(),
      content: document.getElementById('articleContent').value.trim()
    };

    if (!articleData.title) {
      alert('กรุณาระบุหัวข้อบทความ');
      return;
    }

    DS.Articles.save(articleData);
    closeModal();
    showToast(id ? 'บันทึกบทความเรียบร้อยแล้ว' : 'เพิ่มบทความใหม่สำเร็จ');
    renderArticlesTable();
    renderStats();
  }

  function deleteArticle(id) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?')) {
      DS.Articles.delete(id);
      showToast('ลบบทความเรียบร้อยแล้ว');
      renderArticlesTable();
      renderStats();
    }
  }

  /* --------------------------------------------------------------------------
     8. Products Management (จัดการสินค้า 8 หมวดหมู่)
     -------------------------------------------------------------------------- */
  function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    let items = DS.Products.getAll();
    const search = (document.getElementById('searchProducts')?.value || '').toLowerCase().trim();
    const cat = document.getElementById('filterProductCat')?.value || 'all';

    if (search) {
      items = items.filter(p => (p.name || '').toLowerCase().includes(search) || (p.desc || '').toLowerCase().includes(search));
    }
    if (cat !== 'all') {
      items = items.filter(p => p.cat === cat);
    }

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">ไม่พบรายการสินค้า</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(p => `
      <tr>
        <td>
          <img src="${DS.resolveImg(p.image)}" alt="" class="tbl-thumb">
        </td>
        <td>
          <span class="tbl-title-main">${p.name}</span>
          <span class="tbl-subtitle">${(p.desc || '').substring(0, 60)}...</span>
        </td>
        <td>
          <span class="badge badge-green">${p.catName || p.cat}</span>
          ${p.badgeText ? `<span class="badge badge-orange" style="margin-left: 4px;">${p.badgeText}</span>` : ''}
        </td>
        <td style="font-weight: 600; color: var(--primary-green);">
          ฿${(p.price || 0).toLocaleString()} <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">${p.unit || ''}</span>
        </td>
        <td style="font-size: 12.5px; color: var(--text-muted);">
          ${(p.cropNames || []).join(', ') || 'ทั่วไป'}
        </td>
        <td>
          <div class="tbl-actions">
            <button class="btn btn-outline btn-sm" onclick="AdminApp.openProductModal('${p.id}')" title="แก้ไข">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteProduct('${p.id}')" title="ลบ">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openProductModal(id) {
    const modal = document.getElementById('productModal');
    if (!modal) return;

    document.getElementById('productModalTitle').textContent = id ? '✏️ แก้ไขข้อมูลสินค้า' : '➕ เพิ่มสินค้าใหม่';
    document.getElementById('productId').value = id || '';

    if (id) {
      const p = DS.Products.getById(id);
      if (p) {
        document.getElementById('productName').value = p.name || '';
        document.getElementById('productCat').value = p.cat || 'fertilizer';
        document.getElementById('productPrice').value = p.price || 0;
        document.getElementById('productUnit').value = p.unit || '';
        document.getElementById('productBadge').value = p.badge || '';
        document.getElementById('productImage').value = p.image || '';
        document.getElementById('productDesc').value = p.desc || '';
        document.getElementById('previewProductImg').src = DS.resolveImg(p.image);

        // Crop checkboxes
        const crops = p.crops || [];
        document.querySelectorAll('.crop-chk').forEach(chk => {
          chk.checked = crops.includes(chk.value);
        });
      }
    } else {
      document.getElementById('productForm').reset();
      document.getElementById('productCat').value = 'fertilizer';
      document.getElementById('productPrice').value = 500;
      document.getElementById('productUnit').value = '/ถุง';
      document.getElementById('productImage').value = '../frontend/images/product-fertilizer.jpg';
      document.getElementById('previewProductImg').src = '../frontend/images/product-fertilizer.jpg';
      document.querySelectorAll('.crop-chk').forEach(chk => { chk.checked = false; });
    }

    openModal('productModal');
  }

  function saveProduct(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('productId').value;
    const catSelect = document.getElementById('productCat');
    const catName = catSelect.options[catSelect.selectedIndex].text;

    // Badges
    const badgeVal = document.getElementById('productBadge').value;
    const badgeMap = { 'new': '✨ ใหม่', 'hot': '🔥 ขายดี', 'eco': '🌿 Organic', 'star': '⭐ แนะนำ' };

    // Crops
    const selectedCrops = [];
    const selectedCropNames = [];
    document.querySelectorAll('.crop-chk:checked').forEach(chk => {
      selectedCrops.push(chk.value);
      selectedCropNames.push(chk.dataset.name || chk.value);
    });

    const productData = {
      id: id || undefined,
      name: document.getElementById('productName').value.trim(),
      cat: catSelect.value,
      catName: catName,
      price: parseFloat(document.getElementById('productPrice').value || '0'),
      unit: document.getElementById('productUnit').value.trim() || '/หน่วย',
      badge: badgeVal,
      badgeText: badgeMap[badgeVal] || '',
      image: document.getElementById('productImage').value.trim() || '../frontend/images/product-fertilizer.jpg',
      desc: document.getElementById('productDesc').value.trim(),
      crops: selectedCrops,
      cropNames: selectedCropNames
    };

    if (!productData.name) {
      alert('กรุณาระบุชื่อสินค้า');
      return;
    }

    DS.Products.save(productData);
    closeModal();
    showToast(id ? 'บันทึกข้อมูลสินค้าเรียบร้อยแล้ว' : 'เพิ่มสินค้าใหม่สำเร็จ');
    renderProductsTable();
    renderStats();
  }

  function deleteProduct(id) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) {
      DS.Products.delete(id);
      showToast('ลบสินค้าเรียบร้อยแล้ว');
      renderProductsTable();
      renderStats();
    }
  }

  /* --------------------------------------------------------------------------
     9. Navigation Menus Management (ตั้งค่าเมนูเว็บไซต์)
     -------------------------------------------------------------------------- */
  function renderMenusTable() {
    const tbody = document.getElementById('menusTableBody');
    if (!tbody) return;

    const items = DS.Menus.getAll().sort((a, b) => (a.order || 0) - (b.order || 0));

    tbody.innerHTML = items.map(m => `
      <tr>
        <td style="font-weight: 700; width: 60px;">#${m.order || 1}</td>
        <td style="font-weight: 600; color: var(--dark-green); font-size: 15px;">${m.name}</td>
        <td><code>${m.url || '#'}</code></td>
        <td>
          <span class="badge ${m.isActive !== false ? 'badge-green' : 'badge-gray'}">
            ${m.isActive !== false ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          </span>
        </td>
        <td>
          <div class="tbl-actions">
            <button class="btn btn-outline btn-sm" onclick="AdminApp.openMenuModal('${m.id}')" title="แก้ไข">
              <i class="fa-solid fa-pen-to-square"></i> แก้ไข
            </button>
            <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteMenu('${m.id}')" title="ลบ">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openMenuModal(id) {
    const modal = document.getElementById('menuModal');
    if (!modal) return;

    document.getElementById('menuModalTitle').textContent = id ? '✏️ แก้ไขเมนู' : '➕ เพิ่มเมนูใหม่';
    document.getElementById('menuId').value = id || '';

    if (id) {
      const m = DS.Menus.getById(id);
      if (m) {
        document.getElementById('menuName').value = m.name || '';
        document.getElementById('menuUrl').value = m.url || '';
        document.getElementById('menuOrder').value = m.order || 1;
        document.getElementById('menuIsActive').checked = m.isActive !== false;
      }
    } else {
      document.getElementById('menuForm').reset();
      document.getElementById('menuOrder').value = (DS.Menus.getAll().length + 1);
      document.getElementById('menuIsActive').checked = true;
    }

    openModal('menuModal');
  }

  function saveMenu(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('menuId').value;
    const menuData = {
      id: id || undefined,
      name: document.getElementById('menuName').value.trim(),
      url: document.getElementById('menuUrl').value.trim(),
      order: parseInt(document.getElementById('menuOrder').value || '1', 10),
      isActive: document.getElementById('menuIsActive').checked
    };

    if (!menuData.name || !menuData.url) {
      alert('กรุณาระบุชื่อเมนูและ URL ลิงก์');
      return;
    }

    DS.Menus.save(menuData);
    closeModal();
    showToast(id ? 'บันทึกเมนูเรียบร้อยแล้ว' : 'เพิ่มเมนูใหม่สำเร็จ');
    renderMenusTable();
  }

  function deleteMenu(id) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?')) {
      DS.Menus.delete(id);
      showToast('ลบเมนูเรียบร้อยแล้ว');
      renderMenusTable();
    }
  }

  /* --------------------------------------------------------------------------
     10. Media Library (คลังรูปภาพ)
     -------------------------------------------------------------------------- */
  function renderMediaGrid() {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;

    const items = DS.Media.getAll();

    grid.innerHTML = items.map(m => `
      <div class="media-card">
        <div class="media-thumb-wrap">
          <img src="${DS.resolveImg(m.url)}" alt="${m.name}" loading="lazy">
        </div>
        <div class="media-details">
          <span class="media-filename" title="${m.name}">${m.name}</span>
          <span class="media-meta">${m.tag || 'รูปภาพ'} • ${m.size || 'ไฟล์ภาพ'}</span>
          <div class="media-actions">
            <button class="btn btn-outline btn-sm" style="flex:1;" onclick="AdminApp.copyMediaPath('${m.url}')" title="คัดลอก Path ไปใช้งาน">
              <i class="fa-regular fa-copy"></i> คัดลอก Path
            </button>
            <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteMedia('${m.id}')" title="ลบรูป">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function copyMediaPath(path) {
    navigator.clipboard.writeText(path).then(() => {
      showToast(`คัดลอก Path สำเร็จ: ${path}`);
    }).catch(() => {
      prompt('คัดลอก Path รูปภาพนี้:', path);
    });
  }

  function initMediaUploader() {
    const dropzone = document.getElementById('mediaDropzone');
    const fileInput = document.getElementById('mediaFileInput');
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleMediaFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleMediaFiles(fileInput.files);
      }
    });
  }

  function handleMediaFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        const sizeKB = Math.round(file.size / 1024) + ' KB';
        DS.Media.add({
          name: file.name,
          url: base64,
          tag: 'อัปโหลดใหม่',
          size: sizeKB
        });
        showToast(`อัปโหลดรูปภาพ "${file.name}" สำเร็จ!`);
        renderMediaGrid();
        renderStats();
      };
      reader.readAsDataURL(file);
    });
  }

  function deleteMedia(id) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้ออกจากคลัง?')) {
      DS.Media.delete(id);
      showToast('ลบรูปภาพเรียบร้อยแล้ว');
      renderMediaGrid();
      renderStats();
    }
  }

  /* --------------------------------------------------------------------------
     10.5. Direct Image Upload & Media Picker Helper (สำหรับทุกฟอร์มในระบบ)
     -------------------------------------------------------------------------- */
  let activeMediaPickerTargetId = null;

  function handleImageUpload(e, targetInputId) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น (JPG, PNG, WebP)', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      const targetInput = document.getElementById(targetInputId);
      if (targetInput) {
        targetInput.value = base64;
      }

      // อัปเดตพรีวิวตามฟิลด์เป้าหมาย
      if (targetInputId === 'slideFgImage' || targetInputId === 'slideBgImage') {
        updateSlideLivePreview();
      } else if (targetInputId === 'newsImage') {
        const p = document.getElementById('previewNewsImg');
        if (p) p.src = base64;
      } else if (targetInputId === 'articleImage') {
        const p = document.getElementById('previewArticleImg');
        if (p) p.src = base64;
      } else if (targetInputId === 'productImage') {
        const p = document.getElementById('previewProductImg');
        if (p) p.src = base64;
      } else if (targetInputId === 'aboutStoryImage') {
        updateAboutStoryImgPreview();
      }

      // บันทึกลงในคลังรูปภาพ (Media Library) ให้อัตโนมัติ
      const sizeKB = Math.round(file.size / 1024) + ' KB';
      DS.Media.add({
        name: file.name,
        url: base64,
        tag: 'อัปโหลดจากฟอร์ม',
        size: sizeKB
      });
      renderMediaGrid();
      renderStats();

      showToast(`📸 อัปโหลดรูปภาพ "${file.name}" สำเร็จและบันทึกลงคลังรูปภาพแล้ว!`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function openMediaPicker(targetInputId) {
    activeMediaPickerTargetId = targetInputId;
    const searchInput = document.getElementById('searchMediaPicker');
    if (searchInput) searchInput.value = '';
    renderMediaPickerGrid('');
    openModal('mediaPickerModal');
  }

  function renderMediaPickerGrid(filterKeyword = '') {
    const grid = document.getElementById('mediaPickerGrid');
    if (!grid) return;

    const items = DS.Media.getAll();
    const kw = (filterKeyword || '').toLowerCase().trim();
    const filtered = kw
      ? items.filter(m => (m.name && m.name.toLowerCase().includes(kw)) || (m.tag && m.tag.toLowerCase().includes(kw)))
      : items;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-images" style="font-size: 2.5rem; margin-bottom: 10px; color: #ccc;"></i>
          <p>ไม่พบรูปภาพในคลังรูปภาพ สามารถกดปุ่ม "อัปโหลดรูปใหม่เข้าคลัง" ด้านบนได้ทันที</p>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map(m => `
      <div class="media-picker-item" onclick="AdminApp.selectMediaForTarget('${m.url.replace(/'/g, "\\'")}')" title="คลิกเพื่อเลือกรูปนี้">
        <div class="media-picker-thumb">
          <img src="${DS.resolveImg(m.url)}" alt="${m.name}" loading="lazy">
        </div>
        <div class="media-picker-info">
          <span class="media-picker-name">${m.name}</span>
          <span class="media-picker-size">${m.size || ''}</span>
        </div>
      </div>
    `).join('');
  }

  function selectMediaForTarget(url) {
    if (!activeMediaPickerTargetId) return;
    const targetInput = document.getElementById(activeMediaPickerTargetId);
    if (targetInput) {
      targetInput.value = url;
    }

    // อัปเดตพรีวิว
    if (activeMediaPickerTargetId === 'slideFgImage' || activeMediaPickerTargetId === 'slideBgImage') {
      updateSlideLivePreview();
    } else if (activeMediaPickerTargetId === 'newsImage') {
      const p = document.getElementById('previewNewsImg');
      if (p) p.src = DS.resolveImg(url);
    } else if (activeMediaPickerTargetId === 'articleImage') {
      const p = document.getElementById('previewArticleImg');
      if (p) p.src = DS.resolveImg(url);
    } else if (activeMediaPickerTargetId === 'productImage') {
      const p = document.getElementById('previewProductImg');
      if (p) p.src = DS.resolveImg(url);
    } else if (activeMediaPickerTargetId === 'aboutStoryImage') {
      updateAboutStoryImgPreview();
    }

    closeModal();
    showToast('เลือกรูปภาพจากคลังรูปภาพเรียบร้อยแล้ว');
  }

  function handlePickerDirectUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      const sizeKB = Math.round(file.size / 1024) + ' KB';
      DS.Media.add({
        name: file.name,
        url: base64,
        tag: 'อัปโหลดใหม่',
        size: sizeKB
      });
      renderMediaGrid();
      renderStats();
      renderMediaPickerGrid();

      if (activeMediaPickerTargetId) {
        selectMediaForTarget(base64);
      } else {
        showToast(`อัปโหลดรูปภาพ "${file.name}" สำเร็จ!`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  /* --------------------------------------------------------------------------
     11. Backup & Restore
     -------------------------------------------------------------------------- */
  function exportBackup() {
    const jsonStr = DS.Backup.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `farmora-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลดไฟล์สำรองข้อมูล JSON สำเร็จ');
  }

  function importBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = DS.Backup.importJSON(event.target.result);
      if (res.success) {
        showToast('กู้คืนข้อมูลสำเร็จ!');
        renderAll();
      } else {
        alert('เกิดข้อผิดพลาดในการกู้คืน: ' + res.error);
      }
    };
    reader.readAsText(file);
  }

  function resetToDefaults() {
    if (confirm('คำเตือน: คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      DS.Backup.resetDefaults();
      showToast('รีเซ็ตข้อมูลกลับเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
      renderAll();
    }
  }

  /* --------------------------------------------------------------------------
     11.5. Theme & CI Colors Management (ปรับแต่งธีมและสี CI บริษัท)
     -------------------------------------------------------------------------- */
  const THEME_PRESETS = {
    official: {
      primaryColor: '#00A64C',
      darkColor: '#0C7B3B',
      accentColor: '#8EC64F',
      buttonOrange: '#FF6F22'
    },
    harvest: {
      primaryColor: '#FFE327',
      darkColor: '#0C7B3B',
      accentColor: '#8EC64F',
      buttonOrange: '#FF6F22'
    },
    citrus: {
      primaryColor: '#FF6F22',
      darkColor: '#0C7B3B',
      accentColor: '#8EC64F',
      buttonOrange: '#FF6F22'
    },
    smart: {
      primaryColor: '#009CFF',
      darkColor: '#0C7B3B',
      accentColor: '#8EC64F',
      buttonOrange: '#FF6F22'
    },
    earth: {
      primaryColor: '#0C7B3B',
      darkColor: '#371000',
      accentColor: '#8EC64F',
      buttonOrange: '#FF6F22'
    }
  };

  const SHADOW_MAP = {
    soft: {
      card: '0 4px 14px rgba(0, 0, 0, 0.06)',
      hover: '0 8px 20px rgba(0, 0, 0, 0.1)'
    },
    medium: {
      card: '0 8px 24px rgba(0, 0, 0, 0.12)',
      hover: '0 16px 36px rgba(0, 104, 55, 0.18)'
    },
    strong: {
      card: '0 10px 30px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0, 0, 0, 0.08)',
      hover: '0 20px 42px rgba(0, 0, 0, 0.22)'
    },
    glow: {
      card: '0 8px 25px rgba(0, 166, 76, 0.25)',
      hover: '0 16px 38px rgba(0, 166, 76, 0.35)'
    }
  };

  let currentThemeSettings = null;

  function applyTheme(theme) {
    if (!theme) theme = DS.Theme.get();
    currentThemeSettings = { ...theme };

    const root = document.documentElement;
    if (theme.primaryColor) root.style.setProperty('--primary-green', theme.primaryColor);
    if (theme.darkColor) root.style.setProperty('--dark-green', theme.darkColor);
    if (theme.accentColor) root.style.setProperty('--accent-green', theme.accentColor);
    if (theme.buttonOrange) root.style.setProperty('--brand-orange', theme.buttonOrange);

    // Apply shadow
    const shadowCfg = SHADOW_MAP[theme.shadowLevel] || SHADOW_MAP.medium;
    root.style.setProperty('--shadow-md', shadowCfg.card);
    root.style.setProperty('--card-shadow', shadowCfg.card);
    root.style.setProperty('--hover-shadow', shadowCfg.hover);

    // Apply radius
    if (theme.borderRadius) {
      root.style.setProperty('--radius-md', theme.borderRadius);
      root.style.setProperty('--radius-card', theme.borderRadius);
    }
  }

  function renderThemeSettings() {
    const theme = DS.Theme.get();
    currentThemeSettings = { ...theme };

    // Inputs
    const pPicker = document.getElementById('themePrimaryPicker');
    const pHex = document.getElementById('themePrimaryHex');
    if (pPicker && pHex) {
      pPicker.value = theme.primaryColor || '#00A64C';
      pHex.value = theme.primaryColor || '#00A64C';
    }

    const dPicker = document.getElementById('themeDarkPicker');
    const dHex = document.getElementById('themeDarkHex');
    if (dPicker && dHex) {
      dPicker.value = theme.darkColor || '#0C7B3B';
      dHex.value = theme.darkColor || '#0C7B3B';
    }

    const aPicker = document.getElementById('themeAccentPicker');
    const aHex = document.getElementById('themeAccentHex');
    if (aPicker && aHex) {
      aPicker.value = theme.accentColor || '#8EC64F';
      aHex.value = theme.accentColor || '#8EC64F';
    }

    const oPicker = document.getElementById('themeOrangePicker');
    const oHex = document.getElementById('themeOrangeHex');
    if (oPicker && oHex) {
      oPicker.value = theme.buttonOrange || '#FF6F22';
      oHex.value = theme.buttonOrange || '#FF6F22';
    }

    // Presets
    document.querySelectorAll('.theme-preset-card').forEach(card => {
      card.classList.toggle('active', card.dataset.preset === theme.activePreset);
    });

    // Shadow pills
    document.querySelectorAll('#shadowPills .option-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.shadow === theme.shadowLevel);
    });

    // Radius pills
    document.querySelectorAll('#radiusPills .option-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.radius === theme.borderRadius);
    });

    updateThemePreview();
  }

  function selectThemePreset(presetKey) {
    const preset = THEME_PRESETS[presetKey];
    if (!preset) return;

    currentThemeSettings = currentThemeSettings || DS.Theme.get();
    currentThemeSettings.activePreset = presetKey;
    currentThemeSettings.primaryColor = preset.primaryColor;
    currentThemeSettings.darkColor = preset.darkColor;
    currentThemeSettings.accentColor = preset.accentColor;
    currentThemeSettings.buttonOrange = preset.buttonOrange;

    // Update form elements
    const pPicker = document.getElementById('themePrimaryPicker');
    const pHex = document.getElementById('themePrimaryHex');
    if (pPicker && pHex) {
      pPicker.value = preset.primaryColor;
      pHex.value = preset.primaryColor;
    }

    const dPicker = document.getElementById('themeDarkPicker');
    const dHex = document.getElementById('themeDarkHex');
    if (dPicker && dHex) {
      dPicker.value = preset.darkColor;
      dHex.value = preset.darkColor;
    }

    const aPicker = document.getElementById('themeAccentPicker');
    const aHex = document.getElementById('themeAccentHex');
    if (aPicker && aHex) {
      aPicker.value = preset.accentColor;
      aHex.value = preset.accentColor;
    }

    const oPicker = document.getElementById('themeOrangePicker');
    const oHex = document.getElementById('themeOrangeHex');
    if (oPicker && oHex) {
      oPicker.value = preset.buttonOrange;
      oHex.value = preset.buttonOrange;
    }

    document.querySelectorAll('.theme-preset-card').forEach(card => {
      card.classList.toggle('active', card.dataset.preset === presetKey);
    });

    applyTheme(currentThemeSettings);
    updateThemePreview();
    showToast(`เลือกธีมสำเร็จรูป: ${presetKey.toUpperCase()} เรียบร้อย (กดบันทึกเพื่อใช้งานถาวร)`);
  }

  function applyQuickCIColor(type, hex) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hex).catch(() => {});
    }

    currentThemeSettings = currentThemeSettings || DS.Theme.get();
    currentThemeSettings.activePreset = 'custom';

    if (type === 'forest' || type === 'dark') {
      currentThemeSettings.darkColor = hex;
      const elP = document.getElementById('themeDarkPicker');
      const elH = document.getElementById('themeDarkHex');
      if (elP) elP.value = hex;
      if (elH) elH.value = hex;
      showToast(`เลือก ${hex} เป็นสีเข้มหลัก (Forest Green) & คัดลอกรหัสแล้ว`);
    } else if (type === 'primary') {
      currentThemeSettings.primaryColor = hex;
      const elP = document.getElementById('themePrimaryPicker');
      const elH = document.getElementById('themePrimaryHex');
      if (elP) elP.value = hex;
      if (elH) elH.value = hex;
      showToast(`เลือก ${hex} เป็นสีหลักของระบบ (Primary Green) & คัดลอกรหัสแล้ว`);
    } else if (type === 'lime' || type === 'accent') {
      currentThemeSettings.accentColor = hex;
      const elP = document.getElementById('themeAccentPicker');
      const elH = document.getElementById('themeAccentHex');
      if (elP) elP.value = hex;
      if (elH) elH.value = hex;
      showToast(`เลือก ${hex} เป็นสีไฮไลท์อ่อน (Fresh Lime) & คัดลอกรหัสแล้ว`);
    } else if (type === 'orange') {
      currentThemeSettings.buttonOrange = hex;
      const elP = document.getElementById('themeOrangePicker');
      const elH = document.getElementById('themeOrangeHex');
      if (elP) elP.value = hex;
      if (elH) elH.value = hex;
      showToast(`เลือก ${hex} เป็นสีปุ่มส้มแอ็กชัน (Harvest Orange) & คัดลอกรหัสแล้ว`);
    } else {
      // For yellow, blue, soil: copy to clipboard
      showToast(`คัดลอกรหัสสี CI: ${hex} ไปยังคลิปบอร์ดเรียบร้อยแล้ว`);
    }

    document.querySelectorAll('.theme-preset-card').forEach(card => card.classList.remove('active'));
    applyTheme(currentThemeSettings);
    updateThemePreview();
  }

  function onColorInput(type, hex) {
    currentThemeSettings = currentThemeSettings || DS.Theme.get();
    currentThemeSettings.activePreset = 'custom';
    document.querySelectorAll('.theme-preset-card').forEach(card => card.classList.remove('active'));

    if (type === 'primary') {
      currentThemeSettings.primaryColor = hex;
      const el = document.getElementById('themePrimaryHex');
      if (el) el.value = hex;
    } else if (type === 'dark') {
      currentThemeSettings.darkColor = hex;
      const el = document.getElementById('themeDarkHex');
      if (el) el.value = hex;
    } else if (type === 'accent') {
      currentThemeSettings.accentColor = hex;
      const el = document.getElementById('themeAccentHex');
      if (el) el.value = hex;
    } else if (type === 'orange') {
      currentThemeSettings.buttonOrange = hex;
      const el = document.getElementById('themeOrangeHex');
      if (el) el.value = hex;
    }

    applyTheme(currentThemeSettings);
    updateThemePreview();
  }

  function onHexChange(type, hex) {
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      showToast('รูปแบบรหัสสีไม่ถูกต้อง (ตัวอย่าง: #00A64C)', true);
      return;
    }

    currentThemeSettings = currentThemeSettings || DS.Theme.get();
    currentThemeSettings.activePreset = 'custom';
    document.querySelectorAll('.theme-preset-card').forEach(card => card.classList.remove('active'));

    if (type === 'primary') {
      currentThemeSettings.primaryColor = hex;
      const el = document.getElementById('themePrimaryPicker');
      if (el) el.value = hex;
    } else if (type === 'dark') {
      currentThemeSettings.darkColor = hex;
      const el = document.getElementById('themeDarkPicker');
      if (el) el.value = hex;
    } else if (type === 'accent') {
      currentThemeSettings.accentColor = hex;
      const el = document.getElementById('themeAccentPicker');
      if (el) el.value = hex;
    } else if (type === 'orange') {
      currentThemeSettings.buttonOrange = hex;
      const el = document.getElementById('themeOrangePicker');
      if (el) el.value = hex;
    }

    applyTheme(currentThemeSettings);
    updateThemePreview();
  }

  function setShadowLevel(level) {
    currentThemeSettings = currentThemeSettings || DS.Theme.get();
    currentThemeSettings.shadowLevel = level;

    document.querySelectorAll('#shadowPills .option-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.shadow === level);
    });

    applyTheme(currentThemeSettings);
    updateThemePreview();
  }

  function setBorderRadius(radius) {
    currentThemeSettings = currentThemeSettings || DS.Theme.get();
    currentThemeSettings.borderRadius = radius;

    document.querySelectorAll('#radiusPills .option-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.radius === radius);
    });

    applyTheme(currentThemeSettings);
    updateThemePreview();
  }

  function updateThemePreview() {
    const theme = currentThemeSettings || DS.Theme.get();
    const prevDot = document.getElementById('prevBrandDot');
    const prevBadge = document.getElementById('prevBadge');
    const prevCard = document.getElementById('prevCard');
    const prevCardTitle = document.getElementById('prevCardTitle');
    const prevBtnPrimary = document.getElementById('prevBtnPrimary');
    const prevBtnOrange = document.getElementById('prevBtnOrange');
    const prevStat = document.getElementById('prevStat');
    const prevStatIcon = document.getElementById('prevStatIcon');
    const prevStatVal = document.getElementById('prevStatVal');

    if (prevDot) prevDot.style.background = theme.primaryColor;
    if (prevBadge) {
      prevBadge.style.background = theme.accentColor;
    }
    if (prevCardTitle) prevCardTitle.style.color = theme.darkColor;
    if (prevBtnPrimary) prevBtnPrimary.style.background = theme.primaryColor;
    if (prevBtnOrange) prevBtnOrange.style.background = theme.buttonOrange || '#FF6F22';
    if (prevStatIcon) prevStatIcon.style.background = theme.primaryColor;
    if (prevStatVal) prevStatVal.style.color = theme.darkColor;

    const shadowCfg = SHADOW_MAP[theme.shadowLevel] || SHADOW_MAP.medium;
    if (prevCard) {
      prevCard.style.boxShadow = shadowCfg.card;
      prevCard.style.borderRadius = theme.borderRadius || '12px';
    }
    if (prevStat) {
      prevStat.style.boxShadow = shadowCfg.card;
      prevStat.style.borderRadius = theme.borderRadius || '12px';
    }
  }

  function saveThemeSettings() {
    const theme = currentThemeSettings || DS.Theme.get();
    DS.Theme.save(theme);
    showToast('✨ บันทึกการตั้งค่าธีมและสี CI เรียบร้อยแล้ว (อัปเดตทุกหน้าอัตโนมัติ)');
  }

  function resetThemeSettings() {
    if (confirm('คุณต้องการคืนค่าเริ่มต้นของธีมและสี CI เป็นค่าทางการของบริษัทใช่หรือไม่?')) {
      const def = DS.Theme.reset();
      currentThemeSettings = { ...def };
      applyTheme(def);
      renderThemeSettings();
      showToast('คืนค่าเริ่มต้นธีม Farmora CI เรียบร้อยแล้ว');
    }
  }

  /* --------------------------------------------------------------------------
     12. Orders Management (รายการคำสั่งซื้อและการจัดส่ง)
     -------------------------------------------------------------------------- */
  let currentViewingOrderId = null;

  function renderOrdersTable() {
    renderStats();
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (!DS.Orders) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#999;">กำลังโหลดระบบคำสั่งซื้อ...</td></tr>';
      return;
    }

    let orders = DS.Orders.getAll();

    // Filters
    const query = (document.getElementById('searchOrders')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('filterOrderStatus')?.value || 'all';
    const payFilter = document.getElementById('filterOrderPayment')?.value || 'all';

    if (query) {
      orders = orders.filter(o =>
        (o.id && o.id.toLowerCase().includes(query)) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(query)) ||
        (o.customer?.phone && o.customer.phone.includes(query)) ||
        (o.customer?.address && o.customer.address.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== 'all') {
      orders = orders.filter(o => o.status === statusFilter);
    }

    if (payFilter !== 'all') {
      orders = orders.filter(o => o.paymentMethod === payFilter);
    }

    if (orders.length === 0) {
      const isFiltered = query || statusFilter !== 'all' || payFilter !== 'all';
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding: 40px; color: var(--text-muted);">
            <i class="fa-solid fa-cart-arrow-down" style="font-size: 2.5rem; color: #ccc; margin-bottom: 10px; display: block;"></i>
            ${isFiltered 
              ? 'ไม่พบรายการคำสั่งซื้อตามเงื่อนไขที่ค้นหา' 
              : 'ยังไม่มีประวัติคำสั่งซื้อในระบบ (0 รายการ)<br><button type="button" class="btn btn-outline btn-sm" style="margin-top:12px;" onclick="AdminApp.restoreDefaultOrders()"><i class="fa-solid fa-rotate-left"></i> โหลดข้อมูลคำสั่งซื้อตัวอย่างเริ่มต้น</button>'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(order => {
      const items = order.items || [];
      const itemsCount = items.reduce((s, i) => s + (Number(i.qty) || 1), 0);
      const itemsPreview = items.slice(0, 2).map(i => `• ${i.name} (x${i.qty})`).join('<br>');
      const moreItems = items.length > 2 ? `<span style="color:var(--text-muted); font-size:11.5px;">+ อีก ${items.length - 2} รายการ</span>` : '';

      return `
        <tr>
          <td>
            <strong style="color: var(--primary-green); cursor: pointer;" onclick="AdminApp.openOrderDetailModal('${order.id}')">${order.id}</strong>
          </td>
          <td style="font-size: 13px; color: var(--text-muted); white-space: nowrap;">
            ${order.date || order.createdAt?.substring(0, 16) || '-'}
          </td>
          <td>
            <strong style="color: var(--text-main);">${order.customer?.name || '-'}</strong><br>
            <span style="font-size: 12.5px; color: var(--text-muted);"><i class="fa-solid fa-phone" style="font-size: 11px;"></i> ${order.customer?.phone || '-'}</span>
          </td>
          <td>
            <div class="order-items-preview">
              <span>${itemsPreview}</span>
              ${moreItems}
              <small style="color: var(--primary-green); font-weight: 600;">รวม ${itemsCount} ชิ้น</small>
            </div>
          </td>
          <td>
            <strong style="color: #006837; font-size: 15px;">฿${(Number(order.total) || 0).toLocaleString('th-TH')}</strong>
          </td>
          <td>
            <span style="font-size: 13px;">${order.paymentMethodName || (order.paymentMethod === 'cod' ? 'เก็บเงินปลายทาง' : 'โอนเงิน')}</span>
          </td>
          <td>
            <select class="filter-select" style="padding: 4px 8px; font-size: 12.5px; font-weight: 600;" onchange="AdminApp.changeOrderStatus('${order.id}', this.value)">
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>🟡 รอดำเนินการ</option>
              <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>🔵 ชำระแล้ว</option>
              <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>🟣 กำลังจัดส่ง</option>
              <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>🟢 สำเร็จแล้ว</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>🔴 ยกเลิกแล้ว</option>
            </select>
          </td>
          <td style="text-align: center; white-space: nowrap;">
            <button type="button" class="btn-action edit" onclick="AdminApp.openOrderDetailModal('${order.id}')" title="ดูรายละเอียด / ใบเสร็จ">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button type="button" class="btn-action delete" onclick="AdminApp.deleteOrder('${order.id}')" title="ลบคำสั่งซื้อ">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function changeOrderStatus(orderId, newStatus) {
    if (!DS.Orders) return;
    const updated = DS.Orders.updateStatus(orderId, newStatus);
    if (updated) {
      showToast(`อัปเดตสถานะคำสั่งซื้อ #${orderId} เป็น "${updated.statusName}" สำเร็จ`);
      renderOrdersTable();
    }
  }

  function changeSelectedOrderStatus(newStatus) {
    if (!currentViewingOrderId) return;
    changeOrderStatus(currentViewingOrderId, newStatus);
  }

  function openOrderDetailModal(orderId) {
    if (!DS.Orders) return;
    const order = DS.Orders.getById(orderId);
    if (!order) return;

    currentViewingOrderId = orderId;

    const idEl = document.getElementById('invOrderId');
    const dateEl = document.getElementById('invOrderDate');
    const nameEl = document.getElementById('invCustName');
    const phoneEl = document.getElementById('invCustPhone');
    const lineEl = document.getElementById('invCustLine');
    const addrEl = document.getElementById('invCustAddress');
    const noteEl = document.getElementById('invCustNote');
    const payEl = document.getElementById('invPaymentMethod');
    const statusSelect = document.getElementById('modalOrderStatusSelect');
    const tbody = document.getElementById('invItemsTableBody');
    const subtotalEl = document.getElementById('invSubtotal');
    const shippingEl = document.getElementById('invShipping');
    const totalEl = document.getElementById('invTotal');

    if (idEl) idEl.textContent = order.id;
    if (dateEl) dateEl.textContent = `วันที่: ${order.date || order.createdAt?.substring(0, 16) || '-'}`;
    if (nameEl) nameEl.textContent = order.customer?.name || '-';
    if (phoneEl) phoneEl.textContent = order.customer?.phone || '-';
    if (lineEl) lineEl.textContent = order.customer?.lineId || '-';
    if (addrEl) addrEl.textContent = order.customer?.address || '-';
    if (noteEl) noteEl.textContent = order.note || '-';
    if (payEl) payEl.textContent = order.paymentMethodName || (order.paymentMethod === 'cod' ? 'เก็บเงินปลายทาง (COD)' : 'โอนเงินผ่านธนาคาร');
    if (statusSelect) statusSelect.value = order.status || 'pending';

    const items = order.items || [];
    if (tbody) {
      tbody.innerHTML = items.map((item, idx) => {
        const itemImg = DS.resolveImg(item.image || '../frontend/images/product-fertilizer.jpg');
        return `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td>
              <img src="${itemImg}" alt="" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover; border: 1px solid #ddd;" onerror="this.src='https://placehold.co/80x80?text=Farmora'">
            </td>
            <td>
              <strong>${item.name}</strong>
              <div style="font-size: 12px; color: #888;">${item.unit || ''}</div>
            </td>
            <td style="text-align: right;">฿${(Number(item.price) || 0).toLocaleString('th-TH')}</td>
            <td style="text-align: center; font-weight: 600;">${item.qty || 1}</td>
            <td style="text-align: right; font-weight: 600; color: #006837;">฿${(Number(item.total) || 0).toLocaleString('th-TH')}</td>
          </tr>
        `;
      }).join('');
    }

    if (subtotalEl) subtotalEl.textContent = `฿${(Number(order.subtotal) || 0).toLocaleString('th-TH')}`;
    if (shippingEl) shippingEl.textContent = (order.shipping === 0) ? 'ฟรี (โปรโมชั่น)' : `฿${(Number(order.shipping) || 0).toLocaleString('th-TH')}`;
    if (totalEl) totalEl.textContent = `฿${(Number(order.total) || 0).toLocaleString('th-TH')}`;

    openModal('orderDetailModal');
  }

  function deleteOrder(orderId) {
    if (!confirm(`คุณต้องการลบคำสั่งซื้อ #${orderId} ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) return;
    if (DS.Orders) {
      DS.Orders.delete(orderId);
      showToast(`ลบคำสั่งซื้อ #${orderId} เรียบร้อยแล้ว`);
      renderOrdersTable();
    }
  }

  function printOrderInvoice() {
    window.print();
  }

  function clearAllOrders() {
    const list = DS.Orders ? DS.Orders.getAll() : [];
    if (list.length === 0) {
      showToast('ไม่มีประวัติคำสั่งซื้อในระบบอยู่แล้ว');
      return;
    }

    if (!confirm(`⚠️ ยืนยันการล้างประวัติคำสั่งซื้อ!\n\nคุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งซื้อทั้งหมด ${list.length} รายการออกจากระบบ?\n(การกระทำนี้จะล้างประวัติทั้งหมดเป็น 0 รายการ และไม่สามารถย้อนกลับได้)`)) {
      return;
    }

    if (DS.Orders) {
      DS.Orders.clearAll();
      showToast('🗑️ ล้างประวัติคำสั่งซื้อทั้งหมดเรียบร้อยแล้ว');
      renderOrdersTable();
    }
  }

  function restoreDefaultOrders() {
    if (confirm('คุณต้องการโหลดชุดคำสั่งซื้อตัวอย่างเริ่มต้นกลับมาใช่หรือไม่?')) {
      if (DS.Orders) {
        DS.Orders.resetDefaults();
        showToast('โหลดชุดคำสั่งซื้อตัวอย่างเริ่มต้นเรียบร้อยแล้ว');
        renderOrdersTable();
      }
    }
  }

  /* --------------------------------------------------------------------------
     13. Modal Helpers & Toast
     -------------------------------------------------------------------------- */
  function openModal(id) {
    activeModal = document.getElementById(id);
    if (activeModal) {
      activeModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (activeModal) {
      activeModal.classList.remove('open');
      activeModal = null;
      document.body.style.overflow = '';
    }
  }

  function showToast(message, isError = false) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.innerHTML = `
      <i class="${isError ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'}" style="color: ${isError ? 'var(--danger)' : 'var(--primary-green)'}; font-size: 18px;"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Close modal on backdrop click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal();
    }
  });

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Export to Global Scope
  window.AdminApp = {
    switchTab,
    handleLogin,
    handleLogout,
    closeModal,
    showToast,
    // Theme & CI
    applyTheme,
    renderThemeSettings,
    selectThemePreset,
    applyQuickCIColor,
    onColorInput,
    onHexChange,
    setShadowLevel,
    setBorderRadius,
    updateThemePreview,
    saveThemeSettings,
    resetThemeSettings,
    // Slides
    openSlideModal,
    saveSlide,
    deleteSlide,
    updateSlideLivePreview,
    copyForegroundToBackground,
    applyQuickLink,
    // Universal Image Upload & Media Picker
    handleImageUpload,
    openMediaPicker,
    renderMediaPickerGrid,
    selectMediaForTarget,
    handlePickerDirectUpload,
    // About Us
    renderAboutForm,
    saveAboutForm,
    updateAboutStoryImgPreview,
    openTimelineModal,
    saveTimeline,
    deleteTimeline,
    // News
    renderFeaturedNewsBanner,
    editFeaturedNews,
    toggleFeaturedNews,
    openNewsModal,
    saveNews,
    deleteNews,
    // Articles
    openArticleModal,
    saveArticle,
    deleteArticle,
    // Products
    openProductModal,
    saveProduct,
    deleteProduct,
    // Orders Management
    renderOrdersTable,
    changeOrderStatus,
    changeSelectedOrderStatus,
    openOrderDetailModal,
    deleteOrder,
    clearAllOrders,
    restoreDefaultOrders,
    printOrderInvoice,
    // Menus
    openMenuModal,
    saveMenu,
    deleteMenu,
    // Media
    copyMediaPath,
    deleteMedia,
    // Backup
    exportBackup,
    importBackup,
    resetToDefaults
  };

})(window);
