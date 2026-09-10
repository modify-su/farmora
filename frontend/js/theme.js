/* ==========================================================================
   🌿 FARMORA OFFICIAL — Frontend Dynamic Theme & CI Loader (theme.js)
   ==========================================================================
   สคริปต์ควบคุมการสะท้อนสี CI ของบริษัทและสไตล์ UX/UI:
   - อ่านค่าจาก localStorage (farmora_theme_v2)
   - ฉีดตัวแปร CSS (:root) ครบ 7 แม่สี CI และระดับเงา / ความโค้งมน
   - ปรับแต่งการแสดงผลของ Navbar, การ์ดสินค้า, ปุ่ม, และส่วนประกอบหลัก
   - รองรับการซิงค์แบบเรียลไทม์ข้ามแท็บ (storage event)
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'farmora_theme_v2';

  // 7 สี CI ทางการของ Farmora
  const DEFAULT_THEME = {
    ciColors: {
      forest:  { hex: '#0C7B3B', name: 'เขียวเข้มหลัก (Forest Green)' },
      primary: { hex: '#00A64C', name: 'เขียวสดใส (Emerald Green)' },
      lime:    { hex: '#8EC64F', name: 'เขียวตองอ่อน (Fresh Lime)' },
      orange:  { hex: '#FF6F22', name: 'ส้มผลผลิต (Harvest Orange)' },
      yellow:  { hex: '#FFE327', name: 'เหลืองรวงข้าว (Golden Grain)' },
      blue:    { hex: '#009CFF', name: 'ฟ้าสายน้ำ (Water Sky Blue)' },
      soil:    { hex: '#371000', name: 'น้ำตาลดินเข้ม (Earth Soil)' }
    },
    primaryColor: '#00A64C',
    darkColor: '#0C7B3B',
    accentColor: '#8EC64F',
    sidebarBg: '#092615',
    sidebarText: '#ffffff',
    buttonOrange: '#FF6F22',
    shadowLevel: 'medium',
    borderRadius: '12px',
    activePreset: 'official'
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

  function getSavedTheme() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_THEME, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Could not read farmora_theme_v2 from localStorage:', e);
    }
    return DEFAULT_THEME;
  }

  function applyTheme(theme) {
    if (!theme) theme = getSavedTheme();

    const root = document.documentElement;
    const pColor = theme.primaryColor || '#00A64C';
    const dColor = theme.darkColor || '#0C7B3B';
    const aColor = theme.accentColor || '#8EC64F';
    const oColor = theme.buttonOrange || '#FF6F22';

    // 1. ตั้งค่า CSS Variables บน :root
    root.style.setProperty('--primary-green', pColor);
    root.style.setProperty('--dark-green', dColor);
    root.style.setProperty('--accent-green', aColor);
    root.style.setProperty('--brand-orange', oColor);
    root.style.setProperty('--brand-yellow', '#FFE327');
    root.style.setProperty('--brand-blue', '#009CFF');
    root.style.setProperty('--brand-soil', '#371000');

    // เงาและความโค้งมน
    const shadowCfg = SHADOW_MAP[theme.shadowLevel] || SHADOW_MAP.medium;
    root.style.setProperty('--card-shadow', shadowCfg.card);
    root.style.setProperty('--hover-shadow', shadowCfg.hover);
    root.style.setProperty('--shadow-md', shadowCfg.card);

    if (theme.borderRadius) {
      root.style.setProperty('--radius-card', theme.borderRadius);
      root.style.setProperty('--radius-md', theme.borderRadius);
    }

    // 2. ฉีด Dynamic Style Tag เพื่อรองรับ Class ที่ใช้สี CI โดยตรง
    let styleTag = document.getElementById('farmora-dynamic-theme-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'farmora-dynamic-theme-style';
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      :root {
        --primary-green: ${pColor} !important;
        --dark-green: ${dColor} !important;
        --accent-green: ${aColor} !important;
        --brand-orange: ${oColor} !important;
        --card-shadow: ${shadowCfg.card} !important;
        --hover-shadow: ${shadowCfg.hover} !important;
      }
      .btn-contact, .btn-primary {
        background: linear-gradient(135deg, ${pColor} 0%, ${dColor} 100%) !important;
      }
      .menu li a:hover, .dropdown-menu li a:hover {
        color: ${pColor} !important;
      }
      .product-card, .news-card, .about-card, .timeline-card {
        box-shadow: ${shadowCfg.card} !important;
      }
      .product-card:hover, .news-card:hover {
        box-shadow: ${shadowCfg.hover} !important;
      }
      .btn-contact:hover {
        box-shadow: 0 8px 24px ${pColor}44 !important;
      }
    `;
  }

  // ปรับใช้ทันทีที่โหลดสคริปต์
  applyTheme();

  // ปรับใช้เมื่อ DOM โหลดเสร็จอีกครั้ง
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
  });

  // ฟังการเปลี่ยนแปลงธีมข้ามหน้าต่าง (Real-time Cross-Tab Sync)
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      applyTheme();
    }
  });

  window.addEventListener('farmora:themeChanged', (e) => {
    applyTheme(e.detail);
  });

  // Export API
  window.FarmoraTheme = {
    get: getSavedTheme,
    apply: applyTheme,
    DEFAULT_THEME,
    SHADOW_MAP
  };
})();
